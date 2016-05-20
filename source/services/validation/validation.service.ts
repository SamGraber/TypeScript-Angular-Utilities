import { Injectable, Inject, OpaqueToken, Provider } from '@angular/core';

import * as _ from 'lodash';

import { INotificationService, notificationServiceToken } from '../notification/notification.service';

import { ISimpleValidator, IErrorHandler, ICompositeValidator } from './validationTypes';
import { Validator } from './validator';
import { CompositeValidator } from './compositeValidator';

export * from './validationTypes';

export interface IValidationService {
	/**
	 * Build a validator that uses warning notifications to show errors
	 */
	buildNotificationWarningValidator(): ISimpleValidator;

	/**
	 * Build a validator that uses error notifications to show errors
	 */
	buildNotificationErrorValidator(): ISimpleValidator;

	/**
	 * Build a validator that uses a custom handler to show errors
	 *
	 * @param showError A custom handler for validation errors
	 */
	buildCustomValidator(showError: IErrorHandler): ISimpleValidator;

	/**
	 * Build a validator that groups child validators
	 * and uses warning notifications to show errors
	 */
	buildCompositeNotificationWarningValidator(): ICompositeValidator;

	/**
	 * Build a validator that groups child validators
	 * and uses error notifications to show errors
	 */
	buildCompositeNotificationErrorValidator(): ICompositeValidator;

	/**
	 * Build a validator that groups child validators
	 * and uses a custom handler to show errors
	 *
	 * @param showError A custom handler for validation errors
	 */
	buildCompositeCustomValidator(showError: IErrorHandler): ICompositeValidator;
}

@Injectable()
export class ValidationService implements IValidationService {
	private notification: INotificationService;

	constructor(@Inject(notificationServiceToken) notification: INotificationService) {
		this.notification = notification;
	}

	buildNotificationWarningValidator(): ISimpleValidator {
		return new Validator((error: string): void => {
			this.notification.warning(error);
		});
	}

	buildNotificationErrorValidator(): ISimpleValidator {
		return new Validator((error: string): void => {
			this.notification.error(error);
		});
	}

	buildCustomValidator(showError: IErrorHandler): ISimpleValidator {
		return new Validator(showError);
	}

	buildCompositeNotificationWarningValidator(): ICompositeValidator {
		return new CompositeValidator((error: string): void => {
			this.notification.warning(error);
		});
	}

	buildCompositeNotificationErrorValidator(): ICompositeValidator {
		return new CompositeValidator((error: string): void => {
			this.notification.error(error);
		});
	}

	buildCompositeCustomValidator(showError: IErrorHandler): ICompositeValidator {
		return new CompositeValidator(showError);
	}
}

export const validationToken: OpaqueToken = new OpaqueToken('Service for building validation rules');

export const VALIDATION_PROVIDER: Provider = new Provider(validationToken, {
	useClass: ValidationService,
});
