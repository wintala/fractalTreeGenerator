import React, { useEffect, useRef, useState} from 'react'
import frame from './frame.png'


const Canvas = () => {  
  const canvasRef = useRef(null)

  // TODO: yhdistä tilat yhdeksi olioksi
  const [depth, setDepth] = useState(12)
  const [ratio, setRatio] = useState(120)
  const [anglemultiplier, setAnglemultiplier] = useState(10)
  const [initialLength, setInitialLength] = useState(16)
  const [skewness, setSkewness] = useState(8)
  const [threeBranches, setThreeBranches] = useState(false)
  const [leafStyle, setLeafStyle] = useState("summer")
  const [autumnLeavesParameters, setAutumnLeavesParameters] = useState({odds: 0.8, range: 400, constant: 0})

  const [controllersVisible, setControllersVisible] = useState(true)



  const drawLine = (ctx, cordinates) => {
    ctx.beginPath()
    ctx.moveTo(cordinates.startX, cordinates.startY)
    ctx.lineTo(cordinates.endX, cordinates.endY)
    ctx.closePath()
    ctx.stroke()
  }

  const drawLeaf = (ctx, cordinates, colors) => {
    ctx.beginPath()
    ctx.moveTo(cordinates.startX, cordinates.startY)
    ctx.quadraticCurveTo(cordinates.r1X, cordinates.r1Y, cordinates.endX, cordinates.endY)
    ctx.quadraticCurveTo(cordinates.r2X, cordinates.r2Y, cordinates.startX, cordinates.startY)
    ctx.stroke()
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
    ctx.fill()
  }

  
  useEffect(() => {

    if (threeBranches && depth > 8) {
      setDepth(8)
      window.alert("For performance reasons we have to limit the depth when branches split to three")
      return null
    }

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 500
    const width = canvas.width
    const height = canvas.height

    const nextBranchCords = (prevCoordinates) => {
      const prevStartX = prevCoordinates.startX
      const prevStartY = prevCoordinates.startY
      const prevEndX = prevCoordinates.endX
      const prevEndY = prevCoordinates.endY
      const prevAngle = prevCoordinates.angle
  
      const r = ratio / 100
  
      const length = Math.sqrt((prevEndX - prevStartX)**2 + (prevEndY - prevStartY)**2) / r
      const s1 = (skewness > 0) ?  skewness / 50 : 0
      const s2 = (skewness < 0) ?  skewness / 50 : 0
      const angle = prevAngle + (Math.PI / anglemultiplier) + s1
      const angle2 = prevAngle - (Math.PI / anglemultiplier) + s2
  
      const endX = prevEndX + Math.sin(angle) * length
      const endY = prevEndY - Math.cos(angle) * length
      const endX2 = prevEndX + Math.sin(angle2) * length
      const endY2 = prevEndY - Math.cos(angle2) * length

      const branches = [
        {startX: prevEndX, startY: prevEndY, endX, endY, angle},
        {startX: prevEndX, startY: prevEndY, endX: endX2, endY: endY2, angle: angle2}
        ]

      if (threeBranches){
        const middleAngle = prevAngle + s1 / 2 + s2 /2
        const endXMiddle = prevEndX + Math.sin(middleAngle) * length
        const endYMiddle = prevEndY - Math.cos(middleAngle) * length
        const middleBranch = {startX: prevEndX, startY: prevEndY, endX: endXMiddle, endY: endYMiddle, angle: middleAngle}
        return(branches.concat(middleBranch))
      }
  
      return(branches)
    }

    const leafCords = (prevCoordinates, isAutumn) => {
      const prevEndX = prevCoordinates.endX
      const prevEndY = prevCoordinates.endY
      const prevStartX = prevCoordinates.startX
      const prevStartY = prevCoordinates.startY
      const angle = prevCoordinates.angle
  
  
      const length = Math.sqrt((prevEndX - prevStartX)**2 + (prevEndY - prevStartY)**2)
  
      const endX = prevEndX + Math.sin(angle) * length
      const endY = prevEndY - Math.cos(angle) * length
      const r1X = prevEndX + Math.sin(angle + Math.PI / 4) * length / 2 * 1.4
      const r1Y = prevEndY - Math.cos(angle + Math.PI / 4) * length / 2 * 1.4
      const r2X = prevEndX + Math.sin(angle - Math.PI / 4) * length / 2 * 1.4
      const r2Y = prevEndY - Math.cos(angle - Math.PI / 4) * length / 2 * 1.4

      const result = {startX: prevEndX, startY: prevEndY, endX, endY, r1X, r1Y, r2X, r2Y}

      if (isAutumn){
        if (Math.random() > autumnLeavesParameters.odds) {
          const randX = (Math.floor(Math.random() * autumnLeavesParameters.range +autumnLeavesParameters.constant))
          const randY = (Math.floor(Math.random() * autumnLeavesParameters.range +autumnLeavesParameters.constant))

          for (let key in result) {
            if ([result.startY, result.endY, result.r1Y, result.r2Y].includes(result[key])) {
              result[key] += randY
            } 
            else {
            result[key] = result[key] + randX
            }
          }
        }
      }
      
      return(result)
    }

    const initialLine = {startX: width / 2, startY: height, endX: width / 2, endY: height * (1 - initialLength / 100), angle: 0}

    const color = (style) => {
      const colorsAutumn = ["rgb(230, 153, 0)", "rgb(194, 132, 0)", "rgb(171, 54, 0)", "rgb(255, 89, 0)"]
      const colorsSummer = ["rgb(0, 179, 48)", "rgb(0, 153, 41)", "rgb(0, 207, 55)"]
      switch(style) {
        case "autumn":
          return colorsAutumn
        case "summer":
          return colorsSummer
        default:
          return "none"
      }
    }

    const recurseDrawTree = (cords, count, seed, color, isAutumn) => {

      seed++
      drawLine(context, cords)
      const nextCoordinates = nextBranchCords(cords)

      if (seed === count || count <= 0 || !count) {
        if (color !== "none") {
          const leafCoordinates = leafCords(cords, isAutumn)
          drawLeaf(context, leafCoordinates, color)
        }
        return null
      }
      recurseDrawTree(nextCoordinates[0], count, seed, color, isAutumn)
      recurseDrawTree(nextCoordinates[1], count, seed, color, isAutumn)
      if (threeBranches){
        recurseDrawTree(nextCoordinates[2], count, seed, color, isAutumn)
      }
    }

    const col = color(leafStyle)
    const isAutumn = leafStyle === "autumn" ? true : false

    recurseDrawTree(initialLine, depth, 0, col, isAutumn)
  }, [depth, ratio, anglemultiplier, initialLength, leafStyle, skewness, threeBranches, autumnLeavesParameters.odds, autumnLeavesParameters.range, autumnLeavesParameters.constant])
  
  const handleGrowAnimation = () => {
    for (let i = 1; i <= depth; i++) {
      setTimeout(() => {setDepth(i)}, i * 1000 / 3)
    }
  }

  const handleLeafDrop = () => {
    const timePerStep = 1 / 4
    const stepsFace1 = 20
    setLeafStyle("autumn")
    for (let i = 1; i <= stepsFace1; i++) {
      setTimeout(() => {setAutumnLeavesParameters({odds: (stepsFace1 - i) / stepsFace1, range: 100 * i, constant: 0})}, i * 1000 * timePerStep)
    }
    const stepsFace2 = 5
    for (let i = 1; i <= stepsFace2; i++) {
      setTimeout(() => {setAutumnLeavesParameters({odds: 0, range: 100 * stepsFace1, constant: i * 100})}, (stepsFace1 + i) * 1000 * timePerStep)
    }
    setTimeout(() => {
      setAutumnLeavesParameters({odds: 0.8, range: 400, constant: 0})
      setLeafStyle(leafStyle)
    }, (stepsFace1 + stepsFace2 + 1) * 1000 * timePerStep)
  }

  return (
    <>
      <div id="canvas-wrap" onClick={() => setControllersVisible(!controllersVisible)}>
        <canvas id="can" 
          style={{background: leafStyle === "none" ? "linear-gradient(white, white)" : null}} 
          ref={canvasRef}
        />
        <img id="frame" src={frame} alt="frame" />
      </div>
      {controllersVisible ?
      <div id="controllers">
        <h1>Options:</h1>
        <div>
          Animations:
          <div id="anim-buttons">
            <button onClick={handleGrowAnimation}>Grow</button>
            <button onClick={handleLeafDrop}>Drop</button>
          </div>
        </div>
        <div>
          <label htmlFor="depth">Depth</label>
          <input
            id="depth"
            type="number"
            min="1" 
            max={threeBranches ? "8" :"14"}
            value={depth}
            onChange={({ target }) => setDepth(parseInt(target.value))}
          />
        </div>
        <div>
          <label htmlFor="third-branch">Split to three</label>
          <input 
            type="checkbox" 
            id="third-branch"
            checked={threeBranches}
            onChange={() => setThreeBranches(!threeBranches)}
          />
        </div>
        <div>
          <label htmlFor="ration">Ratio of length</label>
          <input 
            type="range" 
            id="ratio" 
            min="100" 
            max="150"
            value={ratio}
            onChange={({ target }) => setRatio(parseInt(target.value))}
          />
        </div>
        <div>
          <label htmlFor="angle">Angle</label>
          <input 
            type="range" 
            id="angle"
            min="4" 
            max="30"
            value={anglemultiplier}
            onChange={({ target }) => setAnglemultiplier(parseInt(target.value))}
          />
        </div>
        <div>
          <label htmlFor="length">Size</label>
          <input 
            type="range" 
            id="length"
            min="10" 
            max="30"
            value={initialLength}
            onChange={({ target }) => setInitialLength(parseInt(target.value))}
          />
        </div>
        <div>
          <label htmlFor="skewness">Skewness</label>
          <input
            type="range" 
            id="skewness"
            min="-30" 
            max="30"
            value={skewness}
            onChange={({ target }) => setSkewness(parseInt(target.value))}
          />
        </div>
        <div className="radio-wrap">
          Season:
          <div className="radio-select">
            <div>
              <input 
                type="radio" 
                id="autumn"
                checked={leafStyle === "autumn" ? true : false}
                onChange={() => setLeafStyle("autumn")}
              />
              <label htmlFor="autumn">Autumn</label>
            </div>
            <div>
              <input 
                type="radio" 
                id="summer"
                checked={leafStyle === "summer" ? true : false}
                onChange={() => setLeafStyle("summer")}
              />
              <label htmlFor="summer">Summer</label>
            </div>
            <div>
              <input 
                type="radio" 
                id="none"
                checked={leafStyle === "none" ? true : false}
                onChange={() => setLeafStyle("none")}
              />
              <label htmlFor="none">None</label>
            </div>
          </div>
        </div>
        <div id="opt-info">
          Click the painting to hide the options
        </div>
      </div> :
      null}
    </>
    
  )
}
const App = () => {
  return(<Canvas />)

}

export default App;
