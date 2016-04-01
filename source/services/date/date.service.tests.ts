import { moduleName } from './date.module';
import { IDateUtility, IDateValue, serviceName } from './date.service';
import { defaultFormats } from './dateTimeFormatStrings';

import { CompareResult } from '../../types/compareResult';

import { angularFixture } from '../test/angularFixture';

import * as angular from 'angular';
import 'angular-mocks';
import * as moment from 'moment';


describe('dateUtility', () => {
	let dateUtility: IDateUtility;

	beforeEach(() => {
		angular.mock.module(moduleName);

		let services: any = angularFixture.inject(serviceName);
		dateUtility = services[serviceName];
	});

	describe('getFullString', (): void => {
		it('should get the month name', (): void => {
			expect(dateUtility.getFullString(0)).to.equal('January');
			expect(dateUtility.getFullString(1)).to.equal('February');
			expect(dateUtility.getFullString(2)).to.equal('March');
			expect(dateUtility.getFullString(3)).to.equal('April');
			expect(dateUtility.getFullString(4)).to.equal('May');
			expect(dateUtility.getFullString(5)).to.equal('June');
			expect(dateUtility.getFullString(6)).to.equal('July');
			expect(dateUtility.getFullString(7)).to.equal('August');
			expect(dateUtility.getFullString(8)).to.equal('September');
			expect(dateUtility.getFullString(9)).to.equal('October');
			expect(dateUtility.getFullString(10)).to.equal('November');
			expect(dateUtility.getFullString(11)).to.equal('December');
		});
	});

	describe('getDays', (): void => {
		it('should get the number of days in the month', (): void => {
			expect(dateUtility.getDays(0)).to.equal(31);
			expect(dateUtility.getDays(2)).to.equal(31);
			expect(dateUtility.getDays(3)).to.equal(30);
			expect(dateUtility.getDays(4)).to.equal(31);
			expect(dateUtility.getDays(5)).to.equal(30);
			expect(dateUtility.getDays(6)).to.equal(31);
			expect(dateUtility.getDays(7)).to.equal(31);
			expect(dateUtility.getDays(8)).to.equal(30);
			expect(dateUtility.getDays(9)).to.equal(31);
			expect(dateUtility.getDays(10)).to.equal(30);
			expect(dateUtility.getDays(11)).to.equal(31);
		});

		it('should account for leap years', (): void => {
			expect(dateUtility.getDays(1, 2015)).to.equal(28);
			expect(dateUtility.getDays(1, 2016)).to.equal(29);
		});
	});

	describe('getDate', (): void => {
		it('should handle dates in string, date, or moment format, defaulting to MM-DD-YYYY format', (): void => {
			let dateString: string = '1/1/2014';
			let date: Date = new Date(dateString);
			let momentInstance: Moment = moment(dateString, defaultFormats.dateFormat)
			expect(dateUtility.getDate(date).format(defaultFormats.isoFormat)).to.equal(momentInstance.format(defaultFormats.isoFormat));
			expect(dateUtility.getDate(dateString).format(defaultFormats.isoFormat)).to.equal(momentInstance.format(defaultFormats.isoFormat));
			expect(dateUtility.getDate(momentInstance).format(defaultFormats.isoFormat)).to.equal(momentInstance.format(defaultFormats.isoFormat));
		});

		it('should handle dates in a user-defined format', (): void => {
			let dateString: string = '2014-1-1T00:00:00-08:00';
			let date: Moment = moment('2014-1-1T00:00:00-08:00', defaultFormats.isoFormat);
			expect(dateUtility.getDate(dateString, defaultFormats.isoFormat).format(defaultFormats.isoFormat)).to.equal(date.format(defaultFormats.isoFormat));
		});
	});

	describe('getDateFromServer', (): void => {
		it('should get dates from string in server format, "YYYY-MM-DDTHH:MM:SSZ"', (): void => {
			let expectedDate: Moment = moment('2015-11-24T20:12:00-07:00', defaultFormats.isoFormat);
			let dateString: string = '2015-11-24T20:12:00-07:00';
			let date: Moment = dateUtility.getDateFromISOString(dateString);
			expect(date).to.deep.equal(expectedDate);
		});
	});

	describe('isDate', (): void => {
		it('should be true if item is a date or a string in date format', (): void => {
			expect(dateUtility.isDate('1/1/2014')).to.be.true;
			expect(dateUtility.isDate(new Date('1/1/2014'))).to.be.true;
		});

		it('should return false if object is not a date', (): void => {
			expect(dateUtility.isDate(null)).to.be.false;
			expect(dateUtility.isDate(<any>{})).to.be.false;
			expect(dateUtility.isDate('123456')).to.be.false;
		});
		it('should return false if object is a Valid date object with an invalid value.', (): void => {
			expect(dateUtility.isDate(new Date("Null"))).to.be.false;
		});
	});

	describe('subtractDates', (): void => {
		it('should get 0 years, months , and days when subtracting ths same date from itself', (): void => {
			let startDate: string = '9/10/2014';
			let endDate: string = '9/10/2014';

			let result: IDateValue = dateUtility.subtractDates(startDate, endDate);

			expect(result.years).to.equal(0);
			expect(result.months).to.equal(0);
			expect(result.days).to.equal(0);
		});

		it('should get 3/3/3 when subtracting 6/6/2006 from 9/9/2009', (): void => {
			let startDate: string = '6/6/2006';
			let endDate: string = '9/9/2009';

			let result: IDateValue = dateUtility.subtractDates(startDate, endDate);

			expect(result.years).to.equal(3);
			expect(result.months).to.equal(3);
			expect(result.days).to.equal(3);
		});

		it('should get 11/30/21 when subtracting 1/1/1999 from 12/31/2020', (): void => {
			let startDate: string = '1/1/1999';
			let endDate: string = '12/31/2020';

			let result: IDateValue = dateUtility.subtractDates(startDate, endDate);

			expect(result.years).to.equal(21);
			expect(result.months).to.equal(11);
			expect(result.days).to.equal(30);
		});

		it('should take leap year into account and return 28 days when subtracting 2/3/2016 from 3/2/2016', (): void => {
			// 2016 is a leap year
			let startDate: string = '2/3/2016';
			let endDate: string = '3/2/2016';

			let result: IDateValue = dateUtility.subtractDates(startDate, endDate);

			expect(result.years).to.equal(0);
			expect(result.months).to.equal(0);
			expect(result.days).to.equal(28);
		});

		it('should properly handle when day and month of start date are higher than day and month of end date', (): void => {
			let startDate: string = '12/31/2000';
			let endDate: string = '1/1/2001';

			let result: IDateValue = dateUtility.subtractDates(startDate, endDate);

			expect(result.years).to.equal(0);
			expect(result.months).to.equal(0);
			expect(result.days).to.equal(1);
		});

		it('should recognize when days are just under a year apart', (): void => {
			let startDate: string = '9/12/2000';
			let endDate: string = '9/10/2001';

			let result: IDateValue = dateUtility.subtractDates(startDate, endDate);

			expect(result.years).to.equal(0);
			expect(result.months).to.equal(11);
			expect(result.days).to.equal(28);
		});
	});

	describe('subtractDatesInDays', (): void => {
		it('should get 0 days when subtracting the same date from itself', (): void => {
			let startDate: string = '9/10/2014';
			let endDate: string = '9/10/2014';

			expect(dateUtility.subtractDateInDays(startDate, endDate)).to.equal(0);
		});

		it('should get 92 when subtracting 6/9/2009 from 9/9/2009', (): void => {
			let startDate: string = '6/9/2009';
			let endDate: string = '9/9/2009';

			// 30 + (2 x 31) = 92
			expect(dateUtility.subtractDateInDays(startDate, endDate)).to.equal(92);
		});

		it('should take leap yer into account and return 28 days when subtracting 2/3/2016 from 3/2/2016', (): void => {
			// 2016 is a leap year
			let startDate: string = '2/3/2016';
			let endDate: string = '3/2/2016';

			expect(dateUtility.subtractDateInDays(startDate, endDate)).to.equal(28);
		});

		it('should properly handle when day and month of start date are higher than day and month of end date', (): void => {
			let startDate: string = '12/31/2000';
			let endDate: string = '1/1/2001';

			expect(dateUtility.subtractDateInDays(startDate, endDate)).to.equal(1);
		});

		it('should handle dates that are just under a year apart', (): void => {
			let startDate: string = '9/12/2000';
			let endDate: string = '9/10/2001';

			expect(dateUtility.subtractDateInDays(startDate, endDate)).to.equal(363);
		});

		it('should return a negative value if the first date is after the second', (): void => {
			let startDate: string = '9/10/2015';
			let endDate: string = '9/10/2014';

			expect(dateUtility.subtractDateInDays(startDate, endDate)).to.equal(-365);
		});
	});

	describe('compareDates', (): void => {
		it('should return less if the first date is before the second', (): void => {
			let date: string = '9/10/2000';
			let laterDate: string = '9/10/2001';

			expect(dateUtility.compareDates(date, laterDate)).to.equal(CompareResult.less);
		});

		it('should return equal if the dates are the same', (): void => {
			let date: string = '9/10/2000';
			let equalDate: string = '9/10/2000';

			expect(dateUtility.compareDates(date, equalDate)).to.equal(CompareResult.equal);
		});

		it('should return greater if the first date if after the second', (): void => {
			let date: string = '9/10/2000';
			let earlierDate: string = '9/10/1999';

			expect(dateUtility.compareDates(date, earlierDate)).to.equal(CompareResult.greater);
		});

		it('should handle date-times where the date is the same', (): void => {
			let date: string = '9/10/2000 10:00 AM';
			let earlierDate: string = '9/10/2000 8:00 AM';

			expect(dateUtility.compareDates(date, earlierDate, defaultFormats.dateTimeFormat)).to.equal(CompareResult.greater);
		});

		it('should handle dates where the hour is the same', (): void => {
			let date: string = '9/10/2000 10:30 AM';
			let earlierDate: string = '9/10/2000 10:15 AM';

			expect(dateUtility.compareDates(date, earlierDate, defaultFormats.dateTimeFormat)).to.equal(CompareResult.greater);
		});
	});

	describe('dateInRange', (): void => {
		it('should return false if the date is before the beginning of the range', (): void => {
			expect(dateUtility.dateInRange('1/1/2014', '1/1/2015', '1/1/2018')).to.be.false;
			expect(dateUtility.dateInRange('12/31/2014', '1/1/2015', '1/1/2018')).to.be.false;
		});

		it('should return false if the date is after the end of the range', (): void => {
			expect(dateUtility.dateInRange('1/1/2019', '1/1/2015', '1/1/2018')).to.be.false;
			expect(dateUtility.dateInRange('1/2/2018', '1/1/2015', '1/1/2018')).to.be.false;
		});

		it('should return true if the date is within the range', (): void => {
			expect(dateUtility.dateInRange('1/1/2015', '1/1/2015', '1/1/2018')).to.be.true;
			expect(dateUtility.dateInRange('1/1/2016', '1/1/2015', '1/1/2018')).to.be.true;
			expect(dateUtility.dateInRange('1/1/2017', '1/1/2015', '1/1/2018')).to.be.true;
			expect(dateUtility.dateInRange('1/1/2018', '1/1/2015', '1/1/2018')).to.be.true;
		});
	});

	describe('sameDate', (): void=> {
		it('should return true that if the dates are the same date', (): void => {
			let date1 = new Date(1995, 11, 17, 12, 0, 0);
			let date2 = new Date(1995, 11, 17, 3, 24, 0);
			let date3 = new Date(1995, 11, 18, 3, 24, 0);
			expect(dateUtility.sameDate(date1, date2)).to.be.true;
			expect(dateUtility.sameDate(date1, date3)).to.be.false;
			expect(dateUtility.sameDate("5/10/1986", "5/10/1986")).to.be.true;
			expect(dateUtility.sameDate("5/10/1986", "5/10/1986")).to.be.true;
			expect(dateUtility.sameDate("5/11/1986", "05/10/1986")).to.be.false;
			expect(dateUtility.sameDate("2011-01-06 10:42:00", "1/6/2011 10:42", "YYYY-MM-DD H:mm", "MM/DD/YYYY HH:mm")).to.be.true;
			expect(dateUtility.sameDate("2011-01-06 10:42:00", "1/6/2011 10:42", "YYYY-MM-DD H:mm")).to.be.false;
			expect(dateUtility.sameDate("2011-01-06 10:42:00", "2011-01-06 10:42:00", "YYYY-MM-DD H:mm")).to.be.true;
			expect(dateUtility.sameDate("2011-01-06 10:42:00", "1/6/2011 10:43", "YYYY-MM-DD H:mm")).to.be.false;
			expect(dateUtility.sameDate("2011-01-06 10:42:00", "1/6/2011 10:42")).to.be.false;
		});
	});
	describe('sameDateTime', (): void=> {
		it('should return true if the dates are the same date and time down to hour and minute', (): void => {
			let date1 = new Date(1995, 11, 17, 0, 24, 0);
			let date2 = new Date(1995, 11, 17, 3, 24, 0);
			let date3 = new Date(1995, 11, 17, 3, 24, 0);
			expect(dateUtility.sameDateTime(date1, date2)).to.be.false;
			expect(dateUtility.sameDateTime(date2, date3)).to.be.true;
			expect(dateUtility.sameDateTime('9/10/2000 10:00 AM', '9/10/2000 8:00 AM')).to.be.false;
			expect(dateUtility.sameDateTime("2011-01-06 10:42:00", "1/6/2011 10:42")).to.be.false;
			expect(dateUtility.sameDateTime("2011-01-06 10:42:00", "1/6/2011 10:42", "YYYY-MM-DD H:mm", "MM/DD/YYYY H:mm")).to.be.true;
			expect(dateUtility.sameDateTime("2011-01-06 10:42:00", "1/6/2011 10:42", "YYYY-MM-DD H:mm")).to.be.false;
			expect(dateUtility.sameDateTime("2011-01-06 10:42:00", "1/6/2011 10:43", "YYYY-MM-DD H:mm")).to.be.false;
			expect(dateUtility.sameDateTime("2011-01-06 10:42:00", "2011-01-06 10:42:00", "YYYY-MM-DD H:mm")).to.be.true;
			expect(dateUtility.sameDateTime("2011-01-06 10:42:00", "1/6/2011 10:42")).to.be.false;
			expect(dateUtility.sameDateTime("5/10/1986T01:15:00", "5/10/1986T01:15:00")).to.be.true;
		});
	});
});
