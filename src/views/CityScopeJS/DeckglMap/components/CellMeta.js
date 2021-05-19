/**
 *
 * Cell meta comp
 */

export const CellMeta = (props) => {
  if (!props.mousePos) return null
  const mousePos = props.mousePos

  return (
    <div
      style={{
        borderRadius: '10%',
        position: 'fixed',
        pointerEvents: 'none',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '1vw',
        color: 'rgba(255,255,255,0.9)',
        zIndex: 10,
        left: mousePos.clientX,
        top: mousePos.clientY,
        fontSize: '0.65em',
        fontWeight: 500,
        fontFamily: 'Roboto Mono',
      }}
    >
      <p>
        Type:
        {props.hoveredObj.object.properties.name}
      </p>
      <p>
        Height:
        {props.hoveredObj.object.properties.height}
      </p>
      <p>
        ID:
        {props.hoveredObj.object.properties.id}
      </p>
    </div>
  )
}
