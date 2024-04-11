import { useState } from 'react'
import {
  Divider,
  IconButton,
  IconButtonProps,
  Progress,
  Switch,
  Text,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react'
import { IconEdit, IconTrash, SectionSpinner } from '@koupr/ui'
import cx from 'classnames'
import { Helmet } from 'react-helmet-async'
import { IoWarning } from 'react-icons/io5'
import StorageAPI from '@/client/api/storage'
import UserAPI from '@/client/idp/user'
import { swrConfig } from '@/client/options'
import AccountChangePassword from '@/components/account/account-change-password'
import AccountDelete from '@/components/account/account-delete'
import AccountEditEmail from '@/components/account/account-edit-email'
import AccountEditFullName from '@/components/account/account-edit-full-name'
import prettyBytes from '@/helpers/pretty-bytes'

const EditButton = (props: IconButtonProps) => (
  <IconButton
    icon={<IconEdit />}
    className={cx('h-[40px]', 'w-[40px]')}
    {...props}
  />
)

const Spacer = () => <div className={cx('grow')} />

const AccountSettingsPage = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { data: user, error: userError } = UserAPI.useGet()
  const { data: storageUsage, error: storageUsageError } =
    StorageAPI.useGetAccountUsage(swrConfig())
  const [isFullNameModalOpen, setIsFullNameModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const sectionClassName = cx('flex', 'flex-col', 'gap-1', 'py-1.5')
  const rowClassName = cx(
    'flex',
    'flex-row',
    'items-center',
    'gap-1',
    `h-[40px]`,
  )

  if (userError) {
    return null
  }
  if (!user) {
    return <SectionSpinner />
  }

  return (
    <>
      <Helmet>
        <title>{user.fullName}</title>
      </Helmet>
      <div className={cx('flex', 'flex-col', 'gap-0')}>
        <div className={sectionClassName}>
          <Text className={cx('font-bold')}>Storage Usage</Text>
          {storageUsageError && <Text>Failed to load storage usage.</Text>}
          {storageUsage && !storageUsageError && (
            <>
              <Text>
                {prettyBytes(storageUsage.bytes)} of{' '}
                {prettyBytes(storageUsage.maxBytes)} used
              </Text>
              <Progress value={storageUsage.percentage} hasStripe />
            </>
          )}
          {!storageUsage && !storageUsageError && (
            <>
              <Text>Calculating…</Text>
              <Progress value={0} hasStripe />
            </>
          )}
        </div>
        <Divider />
        <div className={sectionClassName}>
          <Text className={cx('font-bold')}>Basics</Text>
          <div className={cx(rowClassName)}>
            <Text>Full name</Text>
            <Spacer />
            <Text>{user.fullName}</Text>
            <EditButton
              aria-label=""
              onClick={() => {
                setIsFullNameModalOpen(true)
              }}
            />
          </div>
        </div>
        <Divider />
        <div className={sectionClassName}>
          <Text className={cx('font-bold')}>Credentials</Text>
          <div className={cx(rowClassName)}>
            <Text>Email</Text>
            <Spacer />
            {user.pendingEmail && (
              <div className={cx('flex', 'flex-row', 'items-center')}>
                <Tooltip label="Please check your inbox to confirm your email.">
                  <span>
                    <IoWarning
                      fontSize="20px"
                      className={cx('text-yelow-400')}
                    />
                  </span>
                </Tooltip>
                <Text>{user.pendingEmail}</Text>
              </div>
            )}
            {!user.pendingEmail && (
              <Text>{user.pendingEmail || user.email}</Text>
            )}
            <EditButton
              aria-label=""
              onClick={() => {
                setIsEmailModalOpen(true)
              }}
            />
          </div>
          <div className={cx(rowClassName)}>
            <Text>Password</Text>
            <Spacer />
            <EditButton
              aria-label=""
              onClick={() => {
                setIsPasswordModalOpen(true)
              }}
            />
          </div>
        </div>
        <Divider />
        <div className={sectionClassName}>
          <Text className={cx('font-bold')}>Theme</Text>
          <div className={cx(rowClassName)}>
            <Text>Dark mode</Text>
            <Spacer />
            <Switch
              isChecked={colorMode === 'dark'}
              onChange={() => toggleColorMode()}
            />
          </div>
        </div>
        <Divider />
        <div className={sectionClassName}>
          <Text className={cx('font-bold')}>Advanced</Text>
          <div className={cx(rowClassName)}>
            <Text>Delete account</Text>
            <Spacer />
            <IconButton
              icon={<IconTrash />}
              variant="solid"
              colorScheme="red"
              aria-label=""
              onClick={() => setIsDeleteModalOpen(true)}
            />
          </div>
        </div>
        <AccountEditFullName
          open={isFullNameModalOpen}
          user={user}
          onClose={() => setIsFullNameModalOpen(false)}
        />
        <AccountEditEmail
          open={isEmailModalOpen}
          user={user}
          onClose={() => setIsEmailModalOpen(false)}
        />
        <AccountChangePassword
          open={isPasswordModalOpen}
          user={user}
          onClose={() => setIsPasswordModalOpen(false)}
        />
        <AccountDelete
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      </div>
    </>
  )
}

export default AccountSettingsPage
