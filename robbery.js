'use strict';

var moment = require('./moment');

/**
 * @author Savi
 * Основной метод, который возращает подходящий ближайщий момент начала ограбления.
 * @param {string} json
 * @param {number} minDuration
 * @param {string} workingHours
 * @return {object} appropriateMoment
 */
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();

    // 1. Читаем json
    // 2. Находим подходящий ближайший момент начала ограбления
    // 3. И записываем в appropriateMoment

    var employment = JSON.parse(json);

    var timesPart = [];

    /**
     * Функция, которая составляет график грабителей и банка для дальнейшего поиска.
     * @param {string} sir
     * @param {string} momentGiven
     * @param {boolean} itIsBank
     */
    function getTimeParticipants(sir, momentGiven, itIsBank) {
        if (itIsBank) {
            var bankTime = {};
            // Посмотрим: есть ли переход через сутки
            var hoursFrom = momentGiven['from'].substr(0, 2);
            var minutesFrom = momentGiven['from'].substr(3, 2);
            var hoursTo = momentGiven['to'].substr(0, 2);
            var minutesFrom = momentGiven['to'].substr(3, 2);
            var t1 = new Date(2015, 10, 1, hoursFrom, minutesFrom, 0, 0);
            var t2 = new Date(2015, 10, 1, hoursTo, minutesTo, 0, 0);
            if (t1 > t2) {
                bankTime['to'] = sir + ' ' + momentGiven['from'];
                var ind = bankWorks.indexOf(sir);
                if (ind + 1 < 3) {
                    bankTime['from'] = bankWorks[ind + 1] + ' ' + momentGiven['to'];
                }
            } else {
                bankTime['from'] = sir + ' ' + momentGiven['to'];
                bankTime['to'] = sir + ' ' + momentGiven['from'];
            }
            momentGiven = bankTime;
        }
        timesPart.push(
            {
                sir: sir,
                moment: moment(momentGiven['to']),
                state: 'robber'
            }
        );
        // Если попали на ЧТ
        if (typeof momentGiven['from'] !== 'undefined') {
            timesPart.push(
                {
                    sir: sir,
                    moment: moment(momentGiven['from']),
                    state: 'worker'
                }
            );
        }
    }

    Object.keys(employment).forEach(function (gangSir) {
        for (var i = 0; i < employment[gangSir].length; i++) {
            getTimeParticipants(gangSir, employment[gangSir][i]);
        }
    });

    // Просто сразу распарсим время в ч.п. +5
    var bankTime = {};
    bankTime['from'] = 'ПН' + ' ' + workingHours['from'];
    bankTime['to'] = 'ПН' + ' ' + workingHours['to'];
    var parsedBankTime_1 = moment(bankTime['from']);
    var parsedBankTime_2 = moment(bankTime['to']);
    var newBankTime = {};
    var hoursFrom = parsedBankTime_1.date.getHours();
    var minutesFrom = parsedBankTime_1.date.getMinutes();
    hoursFrom = moment.addZero(hoursFrom);
    minutesFrom = moment.addZero(minutesFrom);
    newBankTime['from'] = hoursFrom + ':' + minutesFrom + '+5';
    var hoursTo = parsedBankTime_2.date.getHours();
    var minutesTo = parsedBankTime_2.date.getMinutes();
    hoursTo = moment.addZero(hoursTo);
    minutesTo = moment.addZero(minutesTo);
    newBankTime['to'] = hoursTo + ':' + minutesTo + '+5';

    /**
     * Не, ну мы то знаем, что банк нужно грабить в ПН, ВТ и СР.
     * Кроме того, банк можно рассматривать как участника ограбления.
     */
    var bankWorks = ['ПН', 'ВТ', 'СР'];
    bankWorks.forEach(function (day) {
        getTimeParticipants(day, newBankTime, true);
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
            if (i + 1 == Object.keys(timesPart).length) {
                // Если успеваем до ЧТ, иначе всех повяжут с новой сигнализацией
                if ((timesPart[i]['moment'].date.getHours() + (minDuration / 60)) < 24) {
                    appropriateMoment = timesPart[i]['moment'];
                    break;
                }
            }
            var timeLeft = timesPart[i + 1]['moment'].date - timesPart[i]['moment'].date;
            if (timeLeft >= minDuration * 60 * 1000) {
                appropriateMoment = timesPart[i]['moment'];
                break;
            }
        }
    }

    return appropriateMoment;
};

/**
 * Возвращает статус ограбления (этот метод уже готов!).
 * @param {string} curMoment
 * @param {object} robberyMoment
 * @return {string}
 */
module.exports.getStatus = function (curMoment, robberyMoment) {
    curMoment = moment(curMoment.date);
    if (curMoment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(curMoment);
    }

    return 'Ограбление уже идёт!';
};
