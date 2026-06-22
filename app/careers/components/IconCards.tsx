import CardIcon from './CardIcon'
import InView from './InView'

interface CardItem {
  icon: string
  title: string
  body: string
}

// Halfspace-style hover-animated icon cards. Square, hairline-gridded; the icon
// micro-moves on hover. Cards stagger in on scroll. Used by Why PL + Benefits.
export default function IconCards({ items, columns = 4 }: { items: readonly CardItem[]; columns?: number }) {
  return (
    <InView className="careers-cards cz-stagger" style={{ ['--cz-cards' as string]: String(columns) }}>
      {items.map((it, i) => (
        <div className="careers-card" key={it.title}>
          <span className="careers-card-index">{String(i + 1).padStart(2, '0')}</span>
          <div className="careers-card-icon">
            <CardIcon name={it.icon} />
          </div>
          <h3 className="careers-card-title">{it.title}</h3>
          <p className="careers-card-body">{it.body}</p>
        </div>
      ))}
    </InView>
  )
}
