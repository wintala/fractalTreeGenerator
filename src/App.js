import React, { useEffect, useRef, useState} from 'react'


const Canvas = () => {
  console.log("render")
  
  const canvasRef = useRef(null)
  const [depth, setDepth] = useState(12)
  const [ratio, setRatio] = useState(120)
  const [anglemultiplier, setAnglemultiplier] = useState(10)
  const [initialLength, setInitialLength] = useState(18)
  const [skewness, setSkewness] = useState(10)
  const [leafStyle, setLeafStyle] = useState("summer")



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
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    canvas.width = 1000
    canvas.height = 600
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
  
  
      return([
        {startX: prevEndX, startY: prevEndY, endX, endY, angle},
        {startX: prevEndX, startY: prevEndY, endX: endX2, endY: endY2, angle: angle2},
        ])
    }

    const leafCords = (prevCoordinates) => {
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
      
  
  
      return({startX: prevEndX, startY: prevEndY, endX, endY, r1X, r1Y, r2X, r2Y})
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

    const recurseDrawTree = (cords, count, seed, color) => {
      const cordsWithoutLength = cords
      delete cordsWithoutLength.length

      seed++
      drawLine(context, cordsWithoutLength)
      const nextCoordinates = nextBranchCords(cords)

      if (seed === count || count <= 0 || !count) {
        if (color !== "none") {
          const leafCoordinates = leafCords(cords)
          drawLeaf(context, leafCoordinates, color)
        }
        return null
      }
      recurseDrawTree(nextCoordinates[0], count, seed, color)
      recurseDrawTree(nextCoordinates[1], count, seed, color)
    }

    const col = color(leafStyle)
    recurseDrawTree(initialLine, depth, 0, col)
  }, [depth, ratio, anglemultiplier, initialLength, leafStyle, skewness])
  
  return (
    <>
      <canvas id="can" ref={canvasRef}/>
      <div id="controllers">
        <div>
          <label htmlFor="depth">Number of branches</label>
          <input
            id="depth"
            type="number"
            min="1" 
            max="14"
            value={depth}
            onChange={({ target }) => setDepth(parseInt(target.value))}
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
          Leaf style:
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
    </>
    
  )
}
const App = () => {
  return(<Canvas />)

}

export default App;
