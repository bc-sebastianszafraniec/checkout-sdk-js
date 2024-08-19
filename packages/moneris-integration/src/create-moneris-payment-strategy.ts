// import { HostedFormFactory } from '@bigcommerce/checkout-sdk/hosted-form-v2';
import { HostedFormFactory } from '@bigcommerce/checkout-sdk/hosted-form-v2';
import {
    PaymentStrategyFactory,
    toResolvableModule,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import MonerisPaymentStrategy from './moneris-payment-strategy';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMonerisPaymentStrategy: PaymentStrategyFactory<any> = (paymentIntegrationService) => {
    return new MonerisPaymentStrategy(
        paymentIntegrationService,
        new HostedFormFactory(paymentIntegrationService),
    );
};

export default toResolvableModule(createMonerisPaymentStrategy, [{ id: 'moneris' }]);
