﻿'use strict';

import * as ng from 'angular';

import {
	INotificationService,
	serviceName as notificationServiceName,
	moduleName as notificationModuleName,
} from '../notification/notification.service';

export var moduleName: string = 'rl21.services.errorHandler';
export var serviceName: string = 'errorHandler';

export enum HttpStatusCode {
	cancelledRequest = -1,
	badRequest = 400,
	unauthorized = 401,
	forbidden = 403,
	invalidUrl = 404,
	timeout = 408,
	internalServerError = 500,
	gone = 410,
}

export interface IRejection {
	status: HttpStatusCode;
	data?: any;
}

export interface IErrorHandlerService {
	httpResponseError(rejection: IRejection): void;
}

export interface IErrorMessages {
	badRequestError: string;
	forbiddenError: string;
	invalidUrlError: string;
	timeoutError: string;
	internalServerError: string;
	defaultError: string;
	goneError: string;
}

export class ErrorHandlerService implements IErrorHandlerService {
	constructor(private $window: ng.IWindowService
		, private $exceptionHandler: ng.IExceptionHandlerService
		, private notification: INotificationService
		, private loginUrl: string
		, private errorMessages: IErrorMessages
		, private returnUrlParam: string) { }

	httpResponseError(rejection: IRejection): void {
		switch (rejection.status) {
			case HttpStatusCode.badRequest:
				this.badRequestError(rejection);
				break;
			case HttpStatusCode.unauthorized:
				this.loggedOutError();
				break;
			case HttpStatusCode.forbidden:
				this.insufficientPermissionsError();
				break;
			case HttpStatusCode.invalidUrl:
				this.invalidUrlError();
				break;
			case HttpStatusCode.timeout:
				this.timeoutError();
				break;
			case HttpStatusCode.internalServerError:
				this.systemError();
				break;
			case HttpStatusCode.gone:
				this.goneError();
				break;
			case HttpStatusCode.cancelledRequest:
				// cancelled request
				break;
			default:
				this.$exceptionHandler(new Error(this.errorMessages.defaultError));
				this.$exceptionHandler(new Error('Status: ' + rejection.status));
				this.$exceptionHandler(new Error('Response: ' + rejection));
				break;
		}
	}

	private badRequestError(rejection: IRejection) {
		if (rejection.data) {
			return this.notification.error(rejection.data);
		}
		return this.notification.error(this.errorMessages.badRequestError);
	}

	private loggedOutError(): void {
		let baseUrl: string = this.$window.location.pathname;
		let queryString: string = this.$window.location.search || '';
		let returnUrl: string = encodeURIComponent(baseUrl + queryString);
		this.$window.location = <any>(this.loginUrl + '?' + this.returnUrlParam + '=' + returnUrl);
	}

	private insufficientPermissionsError(): void {
		this.notification.error(this.errorMessages.forbiddenError);
	}

	private invalidUrlError(): void {
		this.notification.error(this.errorMessages.invalidUrlError);
	}

	private timeoutError(): void {
		this.notification.error(this.errorMessages.timeoutError);
		// retry
	}

	private systemError(): void {
		this.notification.error(this.errorMessages.internalServerError);
	}
	private goneError(): void {
		this.notification.error(this.errorMessages.goneError);
	}
}

export interface IErrorHandlerServiceProvider extends angular.IServiceProvider {
	loginUrl: string;
	errorMessages: IErrorMessages;
	returnUrlParam: string;
	$get($window: ng.IWindowService
		, $exceptionHandler: ng.IExceptionHandlerService
		, notification: INotificationService): IErrorHandlerService;
}

class ErrorHandlerServiceProvider implements IErrorHandlerServiceProvider {
	loginUrl: string;
	errorMessages: IErrorMessages;
	returnUrlParam: string;

	constructor() {
		this.loginUrl = '/login';
		this.errorMessages = {
			badRequestError: 'Your request failed one or more validation checks.',
			forbiddenError: 'You have insufficient permissions to perform this action',
			invalidUrlError: 'Resource not found. This issue has been logged',
			timeoutError: 'Request timed out. Check your network connection or contact your administrator for issues',
			internalServerError: 'The system has encountered an error. This issue has been logged.' +
			' Please contact support if you are unable to complete critical tasks',
			defaultError: 'Http status code not handled',
			goneError: 'The requested resource is no longer available.'
		};
		this.returnUrlParam = 'returnUrl';
		this.$get.$inject = ['$window', '$exceptionHandler', notificationServiceName];
	}

	$get: any = ($window: ng.IWindowService
		, $exceptionHandler: ng.IExceptionHandlerService
		, notification: INotificationService): IErrorHandlerService => {
		return new ErrorHandlerService($window, $exceptionHandler, notification, this.loginUrl, this.errorMessages, this.returnUrlParam);
	}
}

angular.module(moduleName, [notificationModuleName])
	.provider(serviceName, new ErrorHandlerServiceProvider());
