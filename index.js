//Подключает к domElement события touchstart, touchmove, touchend.
//В процессе события, происходит расчет необходимых для поворота и масштабирования параметров, 
//которые передаются в callback функцию cbTouchMove. 
//В cbTouchStart удобно делать предварительную инициализацию каких либо параметров (например запомнить начальный угол объекта или его размер)
//return - функция отписки событий touch от domElement
export default function TouchInit(domElement, cbTouchStart, cbTouchMove, cbTouchEnd) {
    let touchstart = false
    let touchend = false

    let startLen = undefined
    let startAngle = undefined
    let startQuarter = undefined

    let touch0Idx = 0
    let touch1Idx = 1

    function onTouchStart(e) {
        e.preventDefault();
        if (e?.touches?.length == 2) {
            touchstart = true
            touchend = false

            //Принимаем за первую точку ту, которая находится левее, втору соответственно правее
            touch0Idx = 0
            touch1Idx = 1
            if (e.touches[1].pageX < e.touches[0].pageX) {
                touch0Idx = 1
                touch1Idx = 0
            }

            startLen = Math.sqrt(Math.pow(e.touches[touch0Idx].pageX - e.touches[touch1Idx].pageX, 2) + Math.pow(e.touches[touch0Idx].pageY - e.touches[touch1Idx].pageY, 2))
            let angle = Math.atan(Math.abs(e.touches[touch0Idx].pageY - e.touches[touch1Idx].pageY) / Math.abs(e.touches[touch0Idx].pageX - e.touches[touch1Idx].pageX)) * 180 / Math.PI;

            //Определяем началную четверь, она может быть 0 или 3 (удобнее именно 3 а не 1, хотя можно и 1)
            //Так как на старте в touch0Idx.pageX всегда <= touch1Idx.pageX, то по оси X проверку не делаем
            if (e.touches[touch0Idx].pageY >= e.touches[touch1Idx].pageY) {
                startQuarter = 0
            } else {
                angle = Math.abs(angle - 90)
                startQuarter = 3
            }
            startAngle = angle + 90 * startQuarter

            if (cbTouchStart) {
                cbTouchStart(e, startLen, startAngle, startQuarter)
            }
            // console.log("touchstart", e, startLen, angle, startQuarter, startAngle) 
        }
    }

    function onTouchEnd(e) {
        e.preventDefault();
        if (touchstart && e?.touches?.length != 2) {
            touchstart = false
            touchend = true
        }
        if (cbTouchEnd) {
            cbTouchEnd(e)
        }
    }

    function onTouchMove(e) {
        e.preventDefault();
        if (e?.touches?.length == 2) {

            let len = Math.sqrt(Math.pow(e.touches[touch0Idx].pageX - e.touches[touch1Idx].pageX, 2) + Math.pow(e.touches[touch0Idx].pageY - e.touches[touch1Idx].pageY, 2))
            let angle = Math.atan(Math.abs(e.touches[touch0Idx].pageY - e.touches[touch1Idx].pageY) / Math.abs(e.touches[touch0Idx].pageX - e.touches[touch1Idx].pageX)) * 180 / Math.PI;

            //Нумеруем четверти против часовой стрелки начиная с 0. Нулевая четверть левая верхняя.
            //Для четвертей 1 и 3 арктангенс возвращает угол начиная с 90 а не с 0, меняем это на от 0 до 90 (lastAngle = Math.abs(lastAngle - 90))
            let quarter = 0
            if (e.touches[touch0Idx].pageX <= e.touches[touch1Idx].pageX && e.touches[touch0Idx].pageY >= e.touches[touch1Idx].pageY) {
                quarter = 0
            } else if (e.touches[touch0Idx].pageX > e.touches[touch1Idx].pageX && e.touches[touch0Idx].pageY >= e.touches[touch1Idx].pageY) {
                angle = Math.abs(angle - 90)
                quarter = 1
            } else if (e.touches[touch0Idx].pageX > e.touches[touch1Idx].pageX && e.touches[touch0Idx].pageY < e.touches[touch1Idx].pageY) {
                quarter = 2
            } else if (e.touches[touch0Idx].pageX <= e.touches[touch1Idx].pageX && e.touches[touch0Idx].pageY < e.touches[touch1Idx].pageY) {
                angle = Math.abs(angle - 90)
                quarter = 3
            }

            //Текущий угол с учетом четвтерти
            var currentAngle = angle + 90 * quarter
            //Рассчитанный угол на который нужно повернуть объект
            var calcAngleRotate = currentAngle - startAngle

            if (cbTouchMove) {
                //len - текущая длина между косаниями
                //calcAngleRotate - рассчитанный угол на который необходимо повернуть объект
                //quarter - текущая четверть координат
                //startLen - длина между касаниями в момент старта (коснулись двумя пальцами экрана)
                //startAngle - в момента старта (коснулись двумя пальцами экрана)
                //startQuarter - четверть координат в момент старта (коснулись двумя пальцами экрана)
                cbTouchMove(e, len, calcAngleRotate, quarter, startLen, startAngle, startQuarter)
            }
        }
    }
    domElement.addEventListener("touchstart", onTouchStart, false);
    domElement.addEventListener("touchmove", onTouchMove, false);
    domElement.addEventListener("touchend", onTouchEnd, false);
    // domElement.addEventListener("touchcancel", (e) => { console.log(e) }, false);

    //Функция отписки событий touch от domElement
    function removeTouchEvents() {
        domElement.removeEventListener("touchstart", onTouchStart, false);
        domElement.removeEventListener("touchmove", onTouchMove, false);
        domElement.removeEventListener("touchend", onTouchEnd, false);
    }

    //Возвращаем функцию отписки от событий touch
    return removeTouchEvents;
}