import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBillingAddress,
    getCountries,
    getCustomer,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import { BraintreeConnect } from '../braintree';
import BraintreeIntegrationService from '../braintree-integration-service';
import BraintreeScriptLoader from '../braintree-script-loader';
import {
    getBraintreeAcceleratedCheckoutPaymentMethod,
    getBraintreeConnectProfileDataMock,
    getConnectMock,
} from '../mocks/braintree.mock';

import BraintreeAcceleratedCheckoutUtils from './braintree-accelerated-checkout-utils';

describe('BraintreeAcceleratedCheckoutUtils', () => {
    let braintreeConnectMock: BraintreeConnect;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let browserStorage: BrowserStorage;
    let paymentIntegrationService: PaymentIntegrationService;
    let subject: BraintreeAcceleratedCheckoutUtils;

    const countries = getCountries();
    const customer = getCustomer();
    const billingAddress = getBillingAddress();
    const methodId = 'braintreeacceleratedcheckout';
    const paymentMethod = getBraintreeAcceleratedCheckoutPaymentMethod();

    beforeEach(() => {
        braintreeConnectMock = getConnectMock();

        browserStorage = new BrowserStorage('braintree-accelerated-checkout-mock');
        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), window);
        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            window,
        );
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        subject = new BraintreeAcceleratedCheckoutUtils(
            paymentIntegrationService,
            braintreeIntegrationService,
            browserStorage,
        );

        jest.spyOn(browserStorage, 'setItem').mockImplementation(jest.fn);

        jest.spyOn(paymentIntegrationService, 'loadPaymentMethod');
        jest.spyOn(paymentIntegrationService, 'updatePaymentProviderCustomer').mockImplementation(
            jest.fn,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(customer);
        jest.spyOn(paymentIntegrationService.getState(), 'getCountries').mockReturnValue(countries);
        jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
            billingAddress,
        );
        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethod,
        );

        jest.spyOn(braintreeIntegrationService, 'initialize');
        jest.spyOn(braintreeIntegrationService, 'getSessionId').mockImplementation(jest.fn);
        jest.spyOn(braintreeIntegrationService, 'getBraintreeConnect').mockImplementation(
            () => braintreeConnectMock,
        );

        jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({
            customerId: 'customerId',
        });
        jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
            authenticationState: 'succeeded',
            profileData: getBraintreeConnectProfileDataMock(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initializeBraintreeConnectOrThrow()', () => {
        it('throws an error if clientToken is not defined', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                clientToken: undefined,
            });

            try {
                await subject.initializeBraintreeConnectOrThrow(methodId);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws an error if initializationData is not defined', async () => {
            jest.spyOn(
                paymentIntegrationService.getState(),
                'getPaymentMethodOrThrow',
            ).mockReturnValue({
                ...paymentMethod,
                initializationData: undefined,
            });

            try {
                await subject.initializeBraintreeConnectOrThrow(methodId);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('initializes braintree integration service and loads braintree connect', async () => {
            await subject.initializeBraintreeConnectOrThrow(methodId);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalledWith(
                paymentMethod.clientToken,
                paymentMethod.initializationData,
            );
            expect(braintreeIntegrationService.getBraintreeConnect).toHaveBeenCalled();
        });
    });

    describe('#authenticatePayPalConnectUserOrThrow()', () => {
        it('does not authenticate user if braintree connect is not loaded', async () => {
            await subject.authenticatePayPalConnectUserOrThrow();

            expect(paymentIntegrationService.updatePaymentProviderCustomer).not.toHaveBeenCalled();
        });

        it('does not authenticate user if email is not defined', async () => {
            const customerWithoutEmail = { ...customer, email: undefined };
            const billingWithoutEmail = { ...billingAddress, email: undefined };

            jest.spyOn(paymentIntegrationService.getState(), 'getCustomer').mockReturnValue(
                customerWithoutEmail,
            );
            jest.spyOn(paymentIntegrationService.getState(), 'getBillingAddress').mockReturnValue(
                billingWithoutEmail,
            );

            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.authenticatePayPalConnectUserOrThrow();

            expect(paymentIntegrationService.updatePaymentProviderCustomer).not.toHaveBeenCalled();
        });

        it('checks if there is PP Connect account with customer email', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({});

            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.authenticatePayPalConnectUserOrThrow();

            expect(braintreeConnectMock.identity.lookupCustomerByEmail).toHaveBeenCalled();
        });

        it('does not authenticate user does not have PP Connect account', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'lookupCustomerByEmail').mockReturnValue({});

            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.authenticatePayPalConnectUserOrThrow();

            expect(paymentIntegrationService.updatePaymentProviderCustomer).not.toHaveBeenCalled();
        });

        it('triggers PP Connect authentication flow if customer is detected as PP Connect user', async () => {
            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.authenticatePayPalConnectUserOrThrow();

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalled();
        });

        it('successfully authenticate customer with PP Connect', async () => {
            const updatePaymentProviderCustomerPayload = {
                authenticationState: 'succeeded',
                addresses: [
                    {
                        id: 123123,
                        type: 'paypal-address',
                        firstName: 'John',
                        lastName: 'Doe',
                        company: '',
                        address1: 'Hello World Address',
                        address2: '',
                        city: 'Bellingham',
                        stateOrProvince: 'WA',
                        stateOrProvinceCode: 'WA',
                        country: 'United States',
                        countryCode: 'US',
                        postalCode: '98225',
                        phone: '',
                        customFields: [],
                    },
                ],
                instruments: [
                    {
                        bigpayToken: 'pp-vaulted-instrument-id',
                        brand: 'VISA',
                        defaultInstrument: false,
                        expiryMonth: undefined,
                        expiryYear: '02/2037',
                        iin: '',
                        last4: '1111',
                        method: 'braintreeacceleratedcheckout',
                        provider: 'braintreeacceleratedcheckout',
                        trustedShippingAddress: false,
                        type: 'card',
                    },
                ],
            };

            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.authenticatePayPalConnectUserOrThrow();

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );
            expect(browserStorage.setItem).toHaveBeenCalledWith('customer', {
                email: customer.email,
                ...updatePaymentProviderCustomerPayload,
            });
        });

        it('does not authenticate customer if the authentication was canceled or failed', async () => {
            jest.spyOn(braintreeConnectMock.identity, 'triggerAuthenticationFlow').mockReturnValue({
                authenticationState: 'canceled',
                profileData: {},
            });

            const updatePaymentProviderCustomerPayload = {
                authenticationState: 'canceled',
                addresses: undefined,
                instruments: undefined,
            };

            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.authenticatePayPalConnectUserOrThrow();

            expect(braintreeConnectMock.identity.triggerAuthenticationFlow).toHaveBeenCalled();
            expect(paymentIntegrationService.updatePaymentProviderCustomer).toHaveBeenCalledWith(
                updatePaymentProviderCustomerPayload,
            );

            expect(browserStorage.setItem).toHaveBeenCalledWith('customer', {
                email: customer.email,
                ...updatePaymentProviderCustomerPayload,
            });
        });
    });

    describe('#getDeviceSessionId', () => {
        it('returns device session id', async () => {
            await subject.initializeBraintreeConnectOrThrow(methodId);
            await subject.getDeviceSessionId();

            expect(braintreeIntegrationService.getSessionId).toHaveBeenCalled();
        });
    });
});
