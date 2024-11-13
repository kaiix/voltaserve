// Copyright 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.
import { useCallback, useMemo, useState } from 'react'
import { Button, ModalBody, ModalFooter } from '@chakra-ui/react'
import { SectionError, SectionSpinner, Select } from '@koupr/ui'
import { OptionBase, SingleValue } from 'chakra-react-select'
import cx from 'classnames'
import FileAPI from '@/client/api/file'
import InsightsAPI, { Language } from '@/client/api/insights'
import TaskAPI from '@/client/api/task'
import { swrConfig } from '@/client/options'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { modalDidClose } from '@/store/ui/insights'

interface LanguageOption extends OptionBase {
  label: string
  value: string
}

const InsightsCreate = () => {
  const dispatch = useAppDispatch()
  const id = useAppSelector((state) =>
    state.ui.files.selection.length > 0
      ? state.ui.files.selection[0]
      : undefined,
  )
  const mutateFiles = useAppSelector((state) => state.ui.files.mutate)
  const mutateTasks = useAppSelector((state) => state.ui.tasks.mutateList)
  const mutateInfo = useAppSelector((state) => state.ui.insights.mutateInfo)
  const [language, setLanguage] = useState<Language>()
  const {
    data: languages,
    error: languagesError,
    isLoading: isLanguagesLoading,
  } = InsightsAPI.useGetLanguages(swrConfig())
  const {
    data: file,
    error: fileError,
    isLoading: isFileLoading,
  } = FileAPI.useGet(id, swrConfig())
  const existingLanguage = useMemo<LanguageOption | undefined>(() => {
    if (file && languages && file.snapshot?.language) {
      const value = file.snapshot.language
        ? languages.filter((e) => e.id === file.snapshot?.language)[0]
        : undefined
      if (value) {
        setLanguage(value)
        return { value: value.id, label: value.name }
      }
    }
  }, [file, languages])
  const isFileError = !file && fileError
  const isFileReady = file && !fileError
  const isLanguagesError = !languages && languagesError
  const isLanguagesReady = languages && !languagesError

  const handleCreate = useCallback(async () => {
    if (id && language) {
      await InsightsAPI.create(id, { languageId: language.id }, false)
      await mutateInfo?.(await InsightsAPI.getInfo(id))
      await mutateFiles?.()
      await mutateTasks?.(await TaskAPI.list())
      dispatch(modalDidClose())
    }
  }, [language, id, mutateFiles, mutateTasks, mutateInfo, dispatch])

  const handleLanguageChange = useCallback(
    (newValue: SingleValue<LanguageOption>) => {
      if (newValue?.value && languages) {
        setLanguage(languages.filter((e) => e.id === newValue.value)[0])
      }
    },
    [languages],
  )

  return (
    <>
      <ModalBody>
        {isFileLoading ? <SectionSpinner /> : null}
        {isFileError ? <SectionError text="Failed to load file." /> : null}
        {isFileReady ? (
          <>
            {isLanguagesLoading ? <SectionSpinner /> : null}
            {isLanguagesError ? (
              <SectionError text="Failed to load languages." />
            ) : null}
            {isLanguagesReady ? (
              <div
                className={cx(
                  'flex',
                  'flex-col',
                  'items-center',
                  'justify-center',
                  'gap-1.5',
                )}
              >
                <p>
                  Select the language to use for collecting insights. During the
                  process, text will be extracted using OCR (optical character
                  recognition), and entities will be scanned using NER (named
                  entity recognition).
                </p>
                <Select<LanguageOption, false>
                  className={cx('w-full')}
                  defaultValue={existingLanguage}
                  options={languages.map((language) => ({
                    value: language.id,
                    label: language.name,
                  }))}
                  placeholder="Select Language"
                  selectedOptionStyle="check"
                  onChange={handleLanguageChange}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <div className={cx('flex', 'flex-row', 'items-center', 'gap-1')}>
          <Button
            type="button"
            variant="outline"
            colorScheme="blue"
            onClick={() => dispatch(modalDidClose())}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="solid"
            colorScheme="blue"
            isDisabled={!language}
            onClick={handleCreate}
          >
            Collect Insights
          </Button>
        </div>
      </ModalFooter>
    </>
  )
}

export default InsightsCreate
