import { PaymentErrorData } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Response } from '@bigcommerce/request-sender';

declare class DetachmentObserver {
    private _mutationObserver;
    constructor(_mutationObserver: MutationObserverFactory);
    ensurePresence<T>(targets: Node[], promise: Promise<T>): Promise<T>;
}

declare interface HostedCardFieldOptions {
    accessibilityLabel?: string;
    containerId: string;
    placeholder?: string;
}

declare interface HostedCardFieldOptionsMap {
    [HostedFieldType.CardCode]?: HostedCardFieldOptions;
    [HostedFieldType.CardExpiry]: HostedCardFieldOptions;
    [HostedFieldType.CardName]: HostedCardFieldOptions;
    [HostedFieldType.CardNumber]: HostedCardFieldOptions;
}

declare class HostedField {
    private _type;
    private _containerId;
    private _placeholder;
    private _accessibilityLabel;
    private _styles;
    private _eventPoster;
    private _eventListener;
    private _detachmentObserver;
    private _iframe;
    constructor(_type: HostedFieldType, _containerId: string, _placeholder: string, _accessibilityLabel: string, _styles: HostedFieldStylesMap, _eventPoster: IframeEventPoster<HostedFieldEvent>, _eventListener: IframeEventListener<HostedInputEventMap>, _detachmentObserver: DetachmentObserver);
    getType(): HostedFieldType;
    attach(): Promise<void>;
    detach(): void;
    submitForm(fields: HostedFieldType[], data: HostedFormOrderData): Promise<HostedInputSubmitSuccessEvent>;
    validateForm(): Promise<void>;
    private _getFontUrls;
    private _isSubmitErrorEvent;
}

declare interface HostedFieldAttachEvent {
    type: HostedFieldEventType.AttachRequested;
    payload: {
        accessibilityLabel?: string;
        fontUrls?: string[];
        placeholder?: string;
        styles?: HostedFieldStylesMap;
        origin?: string;
        type: HostedFieldType;
    };
}

declare type HostedFieldBlurEventData = HostedInputBlurEvent['payload'];

declare type HostedFieldCardTypeChangeEventData = HostedInputCardTypeChangeEvent['payload'];

declare type HostedFieldEnterEventData = HostedInputEnterEvent['payload'];

declare type HostedFieldEvent = HostedFieldAttachEvent | HostedFieldSubmitRequestEvent | HostedFieldValidateRequestEvent;

declare enum HostedFieldEventType {
    AttachRequested = "HOSTED_FIELD:ATTACH_REQUESTED",
    SubmitRequested = "HOSTED_FIELD:SUBMITTED_REQUESTED",
    ValidateRequested = "HOSTED_FIELD:VALIDATE_REQUESTED"
}

declare type HostedFieldFocusEventData = HostedInputFocusEvent['payload'];

declare type HostedFieldStyles = HostedInputStyles;

declare interface HostedFieldStylesMap {
    default?: HostedFieldStyles;
    error?: HostedFieldStyles;
    focus?: HostedFieldStyles;
}

declare interface HostedFieldSubmitRequestEvent {
    type: HostedFieldEventType.SubmitRequested;
    payload: {
        data: HostedFormOrderData;
        fields: HostedFieldType[];
    };
}

declare enum HostedFieldType {
    CardCode = "cardCode",
    CardExpiry = "cardExpiry",
    CardName = "cardName",
    CardNumber = "cardNumber"
}

declare type HostedFieldValidateEventData = HostedInputValidateEvent['payload'];

declare interface HostedFieldValidateRequestEvent {
    type: HostedFieldEventType.ValidateRequested;
}

declare class HostedForm implements HostedFormInterface {
    private _fields;
    private _eventListener;
    private _eventCallbacks;
    private _bin?;
    private _cardType?;
    constructor(_fields: HostedField[], _eventListener: IframeEventListener<HostedInputEventMap>, _eventCallbacks: HostedFormEventCallbacks);
    getBin(): string | undefined;
    getCardType(): string | undefined;
    attach(): Promise<void>;
    detach(): void;
    validate(): Promise<void>;
    private _getFirstField;
    private _handleEnter;
}

declare interface HostedFormErrorData {
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

declare type HostedFormErrorDataKeys = 'number' | 'expirationDate' | 'expirationMonth' | 'expirationYear' | 'cvv' | 'postalCode';

declare type HostedFormErrorsData = Partial<Record<HostedFormErrorDataKeys, HostedFormErrorData>>;

declare type HostedFormEventCallbacks = Pick<HostedFormOptions, 'onBlur' | 'onCardTypeChange' | 'onFocus' | 'onEnter' | 'onValidate'>;

declare class HostedFormFactory {
    create(host: string, options: HostedFormOptions): HostedForm;
}

declare interface HostedFormInterface {
    attach(): Promise<void>;
    detach(): void;
    getBin(): string | undefined;
    validate(): Promise<void>;
    getCardType(): string | undefined;
}

declare interface HostedFormOptions {
    fields: HostedCardFieldOptionsMap;
    styles?: HostedFieldStylesMap;
    onBlur?(data: HostedFieldBlurEventData): void;
    onCardTypeChange?(data: HostedFieldCardTypeChangeEventData): void;
    onEnter?(data: HostedFieldEnterEventData): void;
    onFocus?(data: HostedFieldFocusEventData): void;
    onValidate?(data: HostedFieldValidateEventData): void;
}

declare interface HostedFormOrderData {
    authToken: string;
}

declare class HostedFormService {
    protected _host: string;
    protected _hostedFormFactory: HostedFormFactory;
    protected _hostedForm?: HostedForm;
    constructor(_host: string, _hostedFormFactory: HostedFormFactory);
    initialize(options: HostedFormOptions): Promise<void>;
    deinitialize(): void;
}

declare interface HostedInputAttachErrorEvent {
    type: HostedInputEventType.AttachFailed;
    payload: {
        error: HostedInputInitializeErrorData;
    };
}

declare interface HostedInputAttachSuccessEvent {
    type: HostedInputEventType.AttachSucceeded;
}

declare interface HostedInputBinChangeEvent {
    type: HostedInputEventType.BinChanged;
    payload: {
        bin?: string;
    };
}

declare interface HostedInputBlurEvent {
    type: HostedInputEventType.Blurred;
    payload: {
        fieldType: HostedFieldType;
        errors?: HostedFormErrorsData;
    };
}

declare interface HostedInputCardTypeChangeEvent {
    type: HostedInputEventType.CardTypeChanged;
    payload: {
        cardType?: string;
    };
}

declare interface HostedInputChangeEvent {
    type: HostedInputEventType.Changed;
    payload: {
        fieldType: HostedFieldType;
    };
}

declare interface HostedInputEnterEvent {
    type: HostedInputEventType.Entered;
    payload: {
        fieldType: HostedFieldType;
    };
}

declare interface HostedInputEventMap {
    [HostedInputEventType.AttachSucceeded]: HostedInputAttachSuccessEvent;
    [HostedInputEventType.AttachFailed]: HostedInputAttachErrorEvent;
    [HostedInputEventType.BinChanged]: HostedInputBinChangeEvent;
    [HostedInputEventType.Blurred]: HostedInputBlurEvent;
    [HostedInputEventType.Changed]: HostedInputChangeEvent;
    [HostedInputEventType.CardTypeChanged]: HostedInputCardTypeChangeEvent;
    [HostedInputEventType.Entered]: HostedInputEnterEvent;
    [HostedInputEventType.Focused]: HostedInputFocusEvent;
    [HostedInputEventType.SubmitSucceeded]: HostedInputSubmitSuccessEvent;
    [HostedInputEventType.SubmitFailed]: HostedInputSubmitErrorEvent;
    [HostedInputEventType.Validated]: HostedInputValidateEvent;
}

declare enum HostedInputEventType {
    AttachSucceeded = "HOSTED_INPUT:ATTACH_SUCCEEDED",
    AttachFailed = "HOSTED_INPUT:ATTACH_FAILED",
    BinChanged = "HOSTED_INPUT:BIN_CHANGED",
    Blurred = "HOSTED_INPUT:BLURRED",
    Changed = "HOSTED_INPUT:CHANGED",
    CardTypeChanged = "HOSTED_INPUT:CARD_TYPE_CHANGED",
    Entered = "HOSTED_INPUT:ENTERED",
    Focused = "HOSTED_INPUT:FOCUSED",
    SubmitSucceeded = "HOSTED_INPUT:SUBMIT_SUCCEEDED",
    SubmitFailed = "HOSTED_INPUT:SUBMIT_FAILED",
    Validated = "HOSTED_INPUT:VALIDATED"
}

declare interface HostedInputFocusEvent {
    type: HostedInputEventType.Focused;
    payload: {
        fieldType: HostedFieldType;
    };
}

declare interface HostedInputInitializeErrorData {
    message: string;
    redirectUrl: string;
}

declare type HostedInputStyles = Partial<Pick<CSSStyleDeclaration, 'color' | 'fontFamily' | 'fontSize' | 'fontWeight'>>;

declare interface HostedInputSubmitErrorEvent {
    type: HostedInputEventType.SubmitFailed;
    payload: {
        error: PaymentErrorData;
        response?: Response<PaymentErrorResponseBody>;
    };
}

declare interface HostedInputSubmitSuccessEvent {
    type: HostedInputEventType.SubmitSucceeded;
    payload: {
        response: Response<unknown>;
    };
}

declare interface HostedInputValidateErrorData {
    fieldType: string;
    message: string;
    type: string;
}

declare interface HostedInputValidateErrorDataMap {
    [HostedFieldType.CardCode]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardExpiry]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardName]?: HostedInputValidateErrorData[];
    [HostedFieldType.CardNumber]?: HostedInputValidateErrorData[];
}

declare interface HostedInputValidateEvent {
    type: HostedInputEventType.Validated;
    payload: HostedInputValidateResults;
}

declare interface HostedInputValidateResults {
    errors: HostedInputValidateErrorDataMap;
    isValid: boolean;
}

declare interface IframeEvent<TType = string, TPayload = any> {
    type: TType;
    payload?: TPayload;
}

declare class IframeEventListener<TEventMap extends IframeEventMap<keyof TEventMap>, TContext = undefined> {
    private _isListening;
    private _listeners;
    private _sourceOrigins;
    constructor(sourceOrigin: string);
    listen(): void;
    stopListen(): void;
    addListener<TType extends keyof TEventMap>(type: TType, listener: (event: TEventMap[TType], context?: TContext) => void): void;
    removeListener<TType extends keyof TEventMap>(type: TType, listener: (event: TEventMap[TType], context?: TContext) => void): void;
    trigger<TType extends keyof TEventMap>(event: TEventMap[TType], context?: TContext): void;
    private _handleMessage;
}

declare type IframeEventMap<TType extends string | number | symbol = string> = {
    [key in TType]: IframeEvent<TType>;
};

declare interface IframeEventPostOptions<TSuccessEvent extends IframeEvent, TErrorEvent extends IframeEvent> {
    errorType?: TErrorEvent['type'];
    successType?: TSuccessEvent['type'];
}

declare class IframeEventPoster<TEvent, TContext = undefined> {
    private _targetWindow?;
    private _context?;
    private _targetOrigin;
    constructor(targetOrigin: string, _targetWindow?: Window | undefined, _context?: TContext | undefined);
    post(event: TEvent): void;
    post<TSuccessEvent extends IframeEvent = IframeEvent, TErrorEvent extends IframeEvent = IframeEvent>(event: TEvent, options: IframeEventPostOptions<TSuccessEvent, TErrorEvent>): Promise<TSuccessEvent>;
    setTarget(window: Window): void;
    setContext(context: TContext): void;
}

declare interface MutationObeserverCreator {
    prototype: MutationObserver;
    new (callback: MutationCallback): MutationObserver;
}

declare class MutationObserverFactory {
    private _window;
    constructor(_window?: MutationObserverWindow);
    create(callback: MutationCallback): MutationObserver;
}

declare interface MutationObserverWindow extends Window {
    MutationObserver: MutationObeserverCreator;
}

/**
 * Creates an instance of `HostedFormService`.
 *
 *
 * @param host - Host url string parameter.
 * @returns An instance of `HostedFormService`.
 */
export declare function createHostedFormService(host: string): HostedFormService;
