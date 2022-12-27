import React, { useEffect } from 'react'
import logo from './logo.svg';
import './App.css';
import { fabric } from 'fabric'
import TouchInit from 'touch-utils';

function App() {
  const [canvas, setCanvas] = React.useState()
  const [photo, setPhoto] = React.useState()
  const [remEventsPhoto, setRemEventsPhoto] = React.useState()
  const [remEventsDiv, setRemEventsDiv] = React.useState()

  React.useEffect(() => {
    let canvas = new fabric.Canvas('canvas', {
      height: 400,
      width: 400,
      backgroundColor: 'white',
      alignSelf: "center",
    });

    setCanvas(canvas)

    //Подключаем touchUtils к изображению на канве
    let startActiveObjectScale = undefined
    let startActiveObjectAngle = undefined

    let removeTouchEvents = TouchInit(canvas.upperCanvasEl,
      () => {
        if (canvas?.getActiveObject()) {
          startActiveObjectScale = canvas.getActiveObject().scaleX
          startActiveObjectAngle = canvas.getActiveObject().angle
        }
      },
      (e, len, calcAngleRotate, quarter, startLen, startAngle, startQuarter) => {
        if (canvas?.getActiveObject()) {
          //Масштаб
          if (startLen) {
            let x = (startActiveObjectScale * len) / startLen
            canvas.getActiveObject().scale(x)
          }

          //Поворот
          canvas.getActiveObject().angle = startActiveObjectAngle - calcAngleRotate
          canvas.renderAll()
          // console.log(e, len, calcAngleRotate, quarter, startLen, startAngle, startQuarter)
        }
      })
      
    setRemEventsPhoto({ r: removeTouchEvents })
    return () => {
      if (removeTouchEvents) {
        removeTouchEvents()
      }
    }
  }, [])


  React.useEffect(() => {
    if (!photo) {
      fabric.Image.fromURL('/photo.jpg', function (img) {
        img.scale(0.5).set({
          originX: "center",
          originY: "center",
          left: 200,
          top: 200,
        });
        img.set('selectable', true);
        img.centeredScaling = true;
        img.lockScalingFlip = true;
        setPhoto(img)
      });
    }
  }, [photo])

  React.useEffect(() => {
    if (photo && canvas) {
      canvas.add(photo).setActiveObject(photo);
      canvas.renderAll();
    }
  }, [photo, canvas])

  const divRef = React.useRef()

  React.useEffect(() => {
    //Подключаем touchUtils к элементу div
    let removeTouchEvents = undefined

    if (divRef?.current) {
      let div = divRef?.current
      let startWidth = parseInt(div.style.width)
      let startHeight = parseInt(div.style.height)
      let startActiveObjectAngle = 0

      removeTouchEvents = TouchInit(div,
        () => {
          startWidth = parseInt(div.style.width)
          startHeight = parseInt(div.style.height)
          startActiveObjectAngle = parseFloat(div.style.transform.replace("rotate(", ""))||0
        },
        (e, len, calcAngleRotate, quarter, startLen, startAngle, startQuarter) => {
          //Масштаб
          if (startLen) {
            // let x = (startActiveObjectScale * len) / startLen
            let deltaDistance = len - startLen
            let x = startWidth + deltaDistance
            let y = startHeight + deltaDistance
            // console.log(startWidth, deltaDistance)
            div.style.width = x + 'px'
            div.style.height = y + 'px'
          }

          //Поворот
          let deg = startActiveObjectAngle - calcAngleRotate
          div.style.webkitTransform = 'rotate(' + deg + 'deg)';
          div.style.mozTransform = 'rotate(' + deg + 'deg)';
          div.style.msTransform = 'rotate(' + deg + 'deg)';
          div.style.oTransform = 'rotate(' + deg + 'deg)';
          div.style.transform = 'rotate(' + deg + 'deg)';
          window.d = div
          // console.log(e, len, calcAngleRotate, quarter, startLen, startAngle, startQuarter)
        })

        setRemEventsDiv({ r: removeTouchEvents })
      return () => {
        if (removeTouchEvents) {
          removeTouchEvents()
        }
      }
    }
  }, [])

  const removeEventsPhoto = React.useCallback(() => {
    if (remEventsPhoto?.r) {
      remEventsPhoto.r()
    }
  }, [remEventsPhoto])


    const removeEventsDiv = React.useCallback(() => {
    if (remEventsDiv?.r) {
      remEventsDiv.r()
    }
  }, [remEventsDiv])

  return (
    <div>
      <canvas id="canvas" />
      <div ref={divRef} style={{ height: "200px", width: "200px", backgroundColor: 'cyan', margin: "0 auto" }} >scale and rotate block</div>
      <div style={{marginTop: "40px"}}>
      <button onClick={removeEventsPhoto} style={{ width: "200px" }}>Stop scale and rotate Image</button>
      </div>
      <div style={{marginTop: "10px"}}>
      <button onClick={removeEventsDiv} style={{ width: "200px" }}>Stop scale and rotate Div</button>
      </div>
    </div>
  );
}

export default App;
