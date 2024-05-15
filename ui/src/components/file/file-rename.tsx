import { useCallback, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { useSWRConfig } from 'swr'
import {
  Field,
  FieldAttributes,
  FieldProps,
  Form,
  Formik,
  FormikHelpers,
} from 'formik'
import * as Yup from 'yup'
import cx from 'classnames'
import FileAPI, { List } from '@/client/api/file'
import useFileListSearchParams from '@/hooks/use-file-list-params'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { renameModalDidClose } from '@/store/ui/files'

type FormValues = {
  name: string
}

const FileRename = () => {
  const { mutate } = useSWRConfig()
  const dispatch = useAppDispatch()
  const { fileId } = useParams()
  const isModalOpen = useAppSelector(
    (state) => state.ui.files.isRenameModalOpen,
  )
  const id = useAppSelector((state) => state.ui.files.selection[0])
  const { data: file, mutate: mutateFile } = FileAPI.useGetById(id)
  const formSchema = Yup.object().shape({
    name: Yup.string().required('Name is required').max(255),
  })
  const fileListSearchParams = useFileListSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => {
      if (isModalOpen) {
        inputRef.current?.focus()
        setTimeout(() => inputRef.current?.select(), 100)
      }
    }, 100)
  }, [inputRef, isModalOpen])

  const handleSubmit = useCallback(
    async (
      { name }: FormValues,
      { setSubmitting }: FormikHelpers<FormValues>,
    ) => {
      if (!file) {
        return
      }
      setSubmitting(true)
      try {
        await mutateFile(await FileAPI.rename(file.id, { name }))
        await mutate<List>(`/files/${fileId}/list?${fileListSearchParams}`)
        setSubmitting(false)
        dispatch(renameModalDidClose())
      } finally {
        setSubmitting(false)
      }
    },
    [file, fileId, fileListSearchParams, dispatch, mutate, mutateFile],
  )

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => dispatch(renameModalDidClose())}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Rename File</ModalHeader>
        <ModalCloseButton />
        <Formik
          enableReinitialize={true}
          initialValues={{ name: file?.name || '' }}
          validationSchema={formSchema}
          validateOnBlur={false}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <Field name="name">
                  {({ field }: FieldAttributes<FieldProps>) => (
                    <FormControl
                      isInvalid={errors.name && touched.name ? true : false}
                    >
                      <Input
                        ref={inputRef}
                        {...field}
                        placeholder="Name"
                        disabled={isSubmitting}
                      />
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </ModalBody>
              <ModalFooter>
                <div
                  className={cx('flex', 'flex-row', 'items-center', 'gap-1')}
                >
                  <Button
                    type="button"
                    variant="outline"
                    colorScheme="blue"
                    disabled={isSubmitting}
                    onClick={() => dispatch(renameModalDidClose())}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="solid"
                    colorScheme="blue"
                    isLoading={isSubmitting}
                  >
                    Save
                  </Button>
                </div>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  )
}

export default FileRename
