'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();

    // 1. Читаем json
    // 2. Находим подходящий ближайший момент начала ограбления
    // 3. И записываем в appropriateMoment

    var employment = JSON.parse(json);

    var timesPart = [];

    function getTimeParticipants (sir, momentGiven, itIsBank) {
        if (itIsBank) {
            var bankTime = {};
            bankTime['from'] = sir + ' ' + momentGiven['to'];
            bankTime['to'] = sir + ' ' + momentGiven['from'];
            momentGiven = bankTime;
        }
        timesPart.push(
            {
                sir: sir,
                moment: moment(momentGiven['from']),
                state: 'worker'
            },
            {
                sir: sir,
                moment: moment(momentGiven['to']),
                state: 'robber'
            }
        );
    }

    Object.keys(employment).forEach(function (gangSir) {
        for (var i = 0; i < employment[gangSir].length; i++) {
            getTimeParticipants(gangSir, employment[gangSir][i]);
        }
    });

    /**
     * Не, ну мы то знаем, что банк нужно грабить в ПН, ВТ и СР.
     * Кроме того, банк можно рассматривать как участника ограбления.
     */
    var bankWorks = ['ПН', 'ВТ', 'СР'];

    bankWorks.forEach(function (day) {
        getTimeParticipants(day, workingHours, true);
    });

    // Отсортировали время по возрастанию
    timesPart.sort(function (t1, t2) {
        if (t1.moment.date > t2.moment.date) {
            return 1;
        }
        if (t1.moment.date < t2.moment.date) {
            return -1;
        }
        return 0;
    });

    // Изначально считаем, что свободно 3 воришки
    var partsFree = Object.keys(employment).length;
    // А нужно 3 + рабочий банк
    var partsNumber = Object.keys(employment).length + 1;
    for (var i = 0; i < Object.keys(timesPart).length; i++) {
        if (timesPart[i]['state'] === 'robber') {
            // Чувак в деле (Ну или банк)
            partsFree++;
        } else {
            // Чувак за честный заработок (Ну или банк закрыт)
            partsFree--;
        }
        if (partsFree == partsNumber) {
            var timeLeft = timesPart[i + 1]['moment'].date - timesPart[i]['moment'].date;
            if (timeLeft >= minDuration * 60 * 1000) {
                appropriateMoment = timesPart[i]['moment'];
                break;
            }
        }
    }

    return appropriateMoment;
};

// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }

    return 'Ограбление уже идёт!';
};
