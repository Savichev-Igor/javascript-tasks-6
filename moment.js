'use strict';

var MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
var MILLISECONDS_PER_HOUR = 1000 * 60 * 60;
var MILLISECONDS_PER_MINUTE = 1000 * 60;

/**
 * @author Savi
 * Основная метод, который возвращает 2 значения и 2 функции методов.
 * @param {string} moment
 * @returns { {date: {Date}, timezone: {number}, format: {Function}, fromMoment: {Function}} }
 */
module.exports = function (moment) {

    // Строим биекцию по дате и дню недели
    var days = {
        'ВС': 0,
        'ПН': 1,
        'ВТ': 2,
        'СР': 3,
        'ЧТ': 4,
        'ПТ': 5,
        'СБ': 6
    };

    /**
     * Функция, которая парсит время из таска в нормальный вид для дальнейшей обработки.
     * @param {string} moment
     * @returns {{day: string, hours: Number, minutes: Number, timezone: Number}}
     */
    function parseDate(moment) {
        var parsedDate = {
            day: moment.substr(0, 2),
            hours: parseInt(moment.substr(3, 2)),
            minutes: parseInt(moment.substr(6, 2)),
            timezone: parseInt(moment.substr(8))
        };
        return parsedDate;
    }

    /**
     * Здесь мы создаём сам объект Date, для дальнейшей обработки, переводя в ч.п. +5.
     * @param {string} moment
     * @returns {Date} newDate
     */
    function createDate(moment) {
        if (typeof moment === 'string' && typeof moment !== 'undefined') {
            var parsedDate = parseDate(moment);
            var newDate = new Date();
            // Выстраиваем дни в последовательность, как в списке
            var untilTimeStampDay = (7 - newDate.getUTCDay() + days[parsedDate.day]) % 7;
            newDate.setUTCDate(newDate.getUTCDate() + untilTimeStampDay);
            newDate.setUTCHours(parsedDate.hours - parsedDate.timezone, parsedDate.minutes, 0, 0);
            return newDate;
        }
    }

    var createdDate = createDate(moment);

    return {
        // Здесь как-то хранится дата ;)
        date: createdDate,

        // А здесь часовой пояс
        timezone: 5,

        /**
         * Выводим дату в переданном формате.
         * @param {string} pattern
         * @return {string} answerStr
         */
        format: function (pattern) {
            if (this.date.getUTCHours() + this.timezone < 0) {
                var answerStr = pattern.replace('%DD', Object.keys(days)[this.date.getDay() - 1]);
                answerStr = answerStr.replace(
                    '%HH', module.exports.addZero(24 + this.date.getUTCHours() + this.timezone)
                );
            } else {
                var answerStr = pattern.replace('%DD', Object.keys(days)[this.date.getDay()]);
                answerStr = answerStr.replace(
                    '%HH', module.exports.addZero(this.date.getUTCHours() + this.timezone)
                );
            }
            answerStr = answerStr.replace('%MM', module.exports.addZero(this.date.getUTCMinutes()));
            return answerStr;
        },

        /**
         * Возвращает кол-во времени между текущей датой и переданной `moment`
         * в человекопонятном виде
         * @param {object} moment
         * @return {string} answerStr
         */
        fromMoment: function (moment) {
            var milisecondsLeft = this.date.getTime() - moment.date.getTime();
            var timeLeft = {};
            timeLeft['days'] = parseInt(milisecondsLeft / MILLISECONDS_PER_DAY);
            milisecondsLeft = milisecondsLeft % MILLISECONDS_PER_DAY;
            timeLeft['hours'] = parseInt(milisecondsLeft / MILLISECONDS_PER_HOUR);
            milisecondsLeft = milisecondsLeft % MILLISECONDS_PER_HOUR;
            timeLeft['minutes'] = parseInt(milisecondsLeft / MILLISECONDS_PER_MINUTE);
            var answerStr = '';
            function getEnd(start_1, start_2, when, what_1, what_2, what_3) {
                switch (timeLeft[when] % 10) {
                    case 1:
                        if (timeLeft[when] == 11) {
                            answerStr += start_2 + timeLeft[when] + what_2;
                            break;
                        }
                        answerStr += start_1 + timeLeft[when] + what_1;
                        break;
                    case 2:
                        if (timeLeft[when] == 12) {
                            answerStr += start_2 + timeLeft[when] + what_2;
                            break;
                        }
                    case 3:
                        if (timeLeft[when] == 13) {
                            answerStr += start_2 + timeLeft[when] + what_2;
                            break;
                        }
                    case 4:
                        if (timeLeft[when] == 14) {
                            answerStr += start_2 + timeLeft[when] + what_2;
                            break;
                        }
                        answerStr += start_2 + timeLeft[when] + what_3;
                        break;
                    default:
                        answerStr += start_2 + timeLeft[when] + what_2;
                }
            }
            if (timeLeft['days'] != 0) {
                getEnd('До ограбления остался ', 'До ограбления осталось ', 'days', ' день ',
                    ' дней ', ' дня ');
                if (timeLeft['hours'] != 0) {
                    getEnd('', '', 'hours', ' час ', ' часов ', ' часа ');
                }
                if (timeLeft['minutes'] != 0) {
                    getEnd('', '', 'minutes', ' минута ', ' минут ', ' минуты ');
                }
            } else {
                if (timeLeft['hours'] != 0) {
                    getEnd('До ограбления остался ', 'До ограбления осталось ', 'hours', ' час ',
                           ' часов ', ' часа ');
                    if (timeLeft['minutes'] != 0) {
                        getEnd('', '', 'minutes', ' минута ', ' минут ', ' минуты ');
                    }
                } else {
                    getEnd('До ограбления осталась ', 'До ограбления осталось ', 'minutes',
                           ' минута ', ' минут ', ' минуты ');
                }
            }

            return answerStr;
        }
    };
};

/**
 * Функция, которая добивает '0' перед цифрой, если это нужно.
 * @param {number} num
 * @returns {string} num
 */
module.exports.addZero = function (num) {
    if (num <= 9) {
        return '0' + num.toString();
    }
    return num;
};
