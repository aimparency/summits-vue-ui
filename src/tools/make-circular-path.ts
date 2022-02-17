import { Vector2 } from 'three'

const SQR_3_4 = Math.sqrt(3/4); 

function rotCCW(v: Vector2) : Vector2 {
  return new Vector2(v.y, -v.x)
}

function rotCW(v: Vector2) : Vector2 {
  return new Vector2(v.y, -v.x)
}

function makeCircularPath(
  from: {x: number, y: number, r: number}, 
  fromShare: number, 
  into: {x: number, y: number, r: number}
) : string {
  let mFrom = new Vector2(from.x, from.y)
  let mInto = new Vector2(into.x, into.y) 

  const delta = mInto.clone().sub(mFrom);
  const R = delta.length();

  if(R < from.r) {
    return ""
  } else {
    const deltaRot = rotCCW(delta); 

    // point beween from and into
    const halfWay = mFrom.clone()
      .add(mInto)
      .multiplyScalar(0.5)

    // center point of arc
    const M = halfWay.clone()
      .add(deltaRot.clone().multiplyScalar(SQR_3_4))

    const getMNorm = (point: Vector2) : Vector2 => {
      return point.clone()
        .sub(M)
        .normalize()
    }

    const getArcPoint = (radius: number) : Vector2 => {
      const a = Math.pow(radius, 2) / (2 * R); 
      const h = Math.sqrt(Math.pow(radius, 2) - Math.pow(a, 2)); 

      const normMToInto = getMNorm(mInto);

      const normMToIntoRot = rotCW(normMToInto); 

      return mInto.clone()
        .sub(normMToInto.clone().multiplyScalar(a))
        .sub(normMToIntoRot.clone().multiplyScalar(h))
    }

    const width = 2 * from.r * fromShare;  // nice!

    const arrowPeak = getArcPoint(into.r); 

    const arrowWings = getArcPoint(into.r + width * 2); 
    const normMToArrowWings = getMNorm(arrowWings); 
    const normMToArrowWingsRot = rotCW(normMToArrowWings); 

    const toFarWingSide = normMToArrowWings.clone().multiplyScalar(width); 
    const toNearWingSide = normMToArrowWings.clone().multiplyScalar(width * 0.5); 

    const wingOuterFar = arrowWings.clone().add(toFarWingSide);
    const wingOuterNear = arrowWings.clone().add(toNearWingSide);
    const wingInnerFar = arrowWings.clone().sub(toFarWingSide);
    const wingInnerNear = arrowWings.clone().sub(toNearWingSide); 

    const normMToMFrom = getMNorm(mFrom); 
    const toTheSide = normMToMFrom.clone().multiplyScalar(width * 0.5); 
    const startOuter = mFrom.clone().add(toTheSide); 
    const startInner = mFrom.clone().sub(toTheSide); 

    const normMToMFromRot = rotCW(normMToMFrom); 

    const outerDistance = wingOuterNear.distanceTo(startOuter); 
    const outerWingControl = wingOuterNear.clone()
      .sub(normMToArrowWingsRot.clone().multiplyScalar(outerDistance * 0.34)); 
    const outerStartControl = startOuter.clone()
      .add(normMToMFromRot.clone().multiplyScalar(outerDistance * 0.34)); 

    const innerDistance = wingInnerNear.distanceTo(startInner); 
    const innerWingControl = wingInnerNear.clone()
      .sub(normMToArrowWingsRot.clone().multiplyScalar(innerDistance * 0.34)); 
    const innerStartControl = startInner.clone()
      .add(normMToMFromRot.clone().multiplyScalar(innerDistance * 0.34)); 

    return [
      'M', startInner, 
      'C', innerStartControl, innerWingControl, wingInnerNear,  
      'L', wingInnerFar, 
      'L', arrowPeak, 
      'L', wingOuterFar, 
      'L', wingOuterNear, 
      'C', outerWingControl, outerStartControl, startOuter, 
      'Z'
    ].map(c => {
      if(c instanceof Vector2) {
        return `${c.x} ${c.y}`;
      } else {
        return c
      }
    }).join(' ') 
  }
}

export default makeCircularPath
