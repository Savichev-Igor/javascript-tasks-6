'use strict';

module.exports = function (moment) {
    if (typeof moment === 'undefined') {
        return;
    }

    var days = {
        'ПН': 1,
        'ВТ': 2,
        'СР': 3,
        'ЧТ': 4,
        'ПТ': 5,
        'СБ': 6,
        'ВС': 7
    };

    function parseDate(moment) {
        var parsedDate = {
            day: moment.substr(0, 2),
            hours: parseInt(moment.substr(3, 2)),
            minutes: parseInt(moment.substr(6, 2)),
            timezone: parseInt(moment.substr(8))
        };
        return parsedDate;
    }

    // Переводим всё в локальное время ч.п. +5
    function createDate(moment) {
        if (typeof moment === 'string' && typeof moment !== 'undefined') {
            var parsedDate = parseDate(moment);
            var newDate = new Date();
            newDate.setUTCDate(days[parsedDate.day]);
            newDate.setUTCHours(parsedDate.hours - parsedDate.timezone, parsedDate.minutes, 0, 0);
            return newDate;
        }
    }

    var createdDate = createDate(moment);

    function addZero (num) {
        if (num < 9) {
            return '0' + num.toString();
        }
        return num;
    }

    return {
        // Здесь как-то хранится дата ;)
        date: createdDate,

        // А здесь часовой пояс
        timezone: 5,

        // Выводит дату в переданном формате
        format: function (pattern) {
            var fixedDate = new Date(createdDate.getTime());
            fixedDate.setHours(fixedDate.getUTCHours() + this.timezone, 0, 0);
            var answerStr = pattern.replace('%DD', Object.keys(days)[fixedDate.getDate() - 1]);
            answerStr = answerStr.replace('%HH', addZero(fixedDate.getHours()));
            answerStr = answerStr.replace('%MM', addZero(fixedDate.getMinutes()));
            return answerStr;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
        }
    };
};
