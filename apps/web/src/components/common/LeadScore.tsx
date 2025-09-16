interface LeadScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function LeadScore({ score, size = 'sm', showLabel = false }: LeadScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    if (score >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'lg':
        return 'text-2xl font-bold px-4 py-2'
      case 'md':
        return 'text-lg font-semibold px-3 py-1.5'
      case 'sm':
      default:
        return 'text-sm font-medium px-2 py-1'
    }
  }

  const colorClass = getScoreColor(score)
  const bgClass = getScoreBg(score)
  const sizeClass = getSizeClasses()

  return (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center rounded-full ${bgClass} ${colorClass} ${sizeClass}`}>
        {score}
      </span>
      {showLabel && (
        <span className="text-sm text-gray-600">Lead Score</span>
      )}
    </div>
  )
}