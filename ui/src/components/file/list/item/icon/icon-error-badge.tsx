import { Circle, Tooltip, useToken } from '@chakra-ui/react'
import classNames from 'classnames'
import { IoClose } from 'react-icons/io5'

const IconErrorBadge = () => {
  const borderColor = useToken('colors', 'gray.200')
  return (
    <Tooltip label="An error occured while processing this item">
      <Circle
        className={classNames(
          'text-orange-600',
          'bg-white',
          'w-[23px]',
          'h-[23px]',
          'border',
          'border-solid',
        )}
        style={{ borderColor }}
      >
        <IoClose className={classNames('text-red-600', 'text-[14px]')} />
      </Circle>
    </Tooltip>
  )
}

export default IconErrorBadge
