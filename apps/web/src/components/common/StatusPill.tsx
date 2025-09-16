interface StatusPillProps {
  status: 'NEW' | 'CRAWLED' | 'ANALYZED'
  size?: 'sm' | 'md'
}

export default function StatusPill({ status, size = 'sm' }: StatusPillProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'NEW':
        return {
          label: 'New',
          className: 'status-pill new'
        }
      case 'CRAWLED':
        return {
          label: 'Crawled',
          className: 'status-pill crawled'
        }
      case 'ANALYZED':
        return {
          label: 'Analyzed',
          className: 'status-pill analyzed'
        }
      default:
        return {
          label: status,
          className: 'status-pill new'
        }
    }
  }

  const config = getStatusConfig()
  const sizeClass = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'

  return (
    <span className={`${config.className} ${sizeClass}`}>
      {config.label}
    </span>
  )
}