import { Breadcrumbs, Button, Divider, Grid } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Step from '@material-ui/core/Step'
import type { StepIconProps } from '@material-ui/core/StepIcon'
import StepLabel from '@material-ui/core/StepLabel'
import Stepper from '@material-ui/core/Stepper'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import AddIcon from '@material-ui/icons/Add'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import { DropzoneDialog } from 'material-ui-dropzone'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import type { Dispatch, SetStateAction } from 'react'
import React, { useCallback, useMemo, useState } from 'react'
import 'react-quill/dist/quill.snow.css'
import type {
  Categories as CategoryType,
  Possible_Values as PossibleValueType,
  Properties as PropertyType,
  // Property_Screens as PropertyScreenType,
  Sub_Categories as SubCategoryType,
} from '../../../generated/graphql'
import { useCity } from '../../../utils/city/city-context'
import { upload } from '../../../utils/object-storage/upload'
import useMobileView from '../../../utils/use-mobile-view/use-mobile-view'
import useSearchParams from '../../../utils/use-search-params/use-search-params'
import { useUser } from '../../../utils/user/user-context'
import FormCard from '../form-card/form-card'
// import { makeStyles } from '@material-ui/core/styles'
import InputElements, { InputElementsType } from './InputElements'
import styles from './post-form.module.scss'
import usePostFormFeilds from './use-post-form-fields'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export type PostFormProps = {
  loading: boolean
  error: Error | null
  onFinish: () => void | Promise<void>

  fields: ReturnType<typeof usePostFormFeilds>

  categories: (Pick<CategoryType, 'id' | 'name'> & {
    sub_categories: (Pick<
      SubCategoryType,
      'id' | 'name' | 'max_post_images'
    > & {
      properties: (Pick<
        PropertyType,
        'id' | 'name' | 'order' | 'is_mandatory'
        // @ts-ignore
      > & { possible_values: Pick<PossibleValueType, 'id' | 'name'>[] })[]
    })[]
  })[]
  // property_screens: Pick<PropertyScreenType, 'id' | 'name' | 'order'>[]
}

function StepIcon({ active, completed }: StepIconProps) {
  return (
    <CheckCircleIcon
      color={completed ? 'primary' : active ? 'secondary' : 'disabled'}
    />
  )
}

function FormButton({
  disabled,
  setActiveStep,
  stepsCount,
  onFinish,
}: {
  disabled: boolean
  setActiveStep: Dispatch<SetStateAction<number>>
  stepsCount: number
  onFinish: () => void | Promise<void>
}) {
  return (
    <>
      <span />

      <Button
        variant="contained"
        size="large"
        color="primary"
        disabled={disabled}
        onClick={() =>
          setActiveStep((prev) => {
            if (prev + 1 < stepsCount) {
              return prev + 1
            } else {
              onFinish()
              return prev
            }
          })
        }
      >
        Save &amp; Continue
      </Button>
    </>
  )
}

function PostForm({
  loading,
  error,
  onFinish: _onFinish,

  fields,

  categories,
}: PostFormProps) {
  const { user, auth } = useUser(true)
  const { zipAndCity } = useCity()
  const query = useSearchParams()
  const onboarding = query.get('onboarding') === '1'

  const makingscreens = () => {
    const selectedCategory = categories.find((c) => c.id === fields.category_id)

    const selectedSubCategory = selectedCategory?.sub_categories.find(
      (c) => c.id === fields.sub_category_id
    )

    const properties = selectedSubCategory?.properties
    if (!properties) return null
    const data = properties.sort((a: any, b: any) =>
      a.order < b.order ? -1 : a.order > b.order ? 1 : 0
    )
    return data
  }

  const [formstatus, setformstatus] = useState<any>(fields.attributes)

  const handleChange = (
    value: any,
    key: string,
    parent: string,
    children?: string
  ) => {
    let obj = {
      ...formstatus,
    }
    if (!value) {
      delete obj[parent][key]
      if (children) {
        delete obj[parent][children]
      }
    } else {
      let child = formstatus[parent] ?? {}
      child = {
        ...child,
        [key]: value,
      }
      obj[parent] = child
    }
    const { length } = Object.keys(obj[parent])
    if (length === 0) {
      delete obj[parent]
    }
    console.log('obj: ', obj)
    setformstatus(obj)
    setAttributes(obj)
  }

  const steps = useMemo<{ label: string; data: any }[]>(() => {
    const data = makingscreens()
    console.log({ data })
    const ret = [
      { label: 'Category', data: '' },
      { label: 'Sub Category', data: '' },
      { label: 'Title & Description', data: '' },
      { label: 'Pricing', data: '' },
    ]
    if (data?.length)
      ret.push({
        label: 'Additional Info',
        //@ts-ignore
        data,
      })
    return ret
  }, [makingscreens])
  const [activeStep, setActiveStep] = useState(0)

  const wide = useMobileView({ inverse: true, threshold: 'md' })
  const narrow = useMobileView({ threshold: 'md' })

  const {
    // FORM - General:

    category_id,
    setCategoryId,

    sub_category_id,
    setSubCategoryId,

    // FORM - Title & Description:

    title,
    setTitle,

    detail,
    setDetail,

    attachment_files,
    setAttachmentFiles,

    is_local,
    setIsLocal,

    // FORM - Pricing:

    prices,
    setPrices,

    years_of_experience,
    setYearsOfExperience,

    // FORM - <attributes>

    attributes,
    setAttributes,
  } = fields

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<Error | null>(null)

  const handleUpload = useCallback(
    (files: File[]) => {
      const token = auth.idToken?.token
      if (!files.length || !token) {
        return
      }

      setUploading(true)
      setUploadError(null)

      Promise.all(files.map((file) => upload(file, token)))
        .then((uploadedFiles) =>
          setAttachmentFiles((prev) => [
            ...prev,
            ...uploadedFiles.map(({ file }) => ({
              id: file.id,
              url: file.url,
              name: file.name,
            })),
          ])
        )
        .catch(setUploadError)
        .finally(() => setUploading(false))
    },
    [auth.idToken?.token, setAttachmentFiles]
  )

  return (
    <main className={styles.postForm}>
      <div className={styles.postForm__paper}>
        {!user || !zipAndCity ? null : (
          <>
            <div className={styles.postForm__paperTopRow}>
              {steps.length && activeStep > 0 ? (
                <Button
                  className={styles.postForm__paperTopRowBackButton}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  title="Back"
                >
                  <ArrowBackIcon />
                </Button>
              ) : onboarding ? (
                <NextLink href="/settings/seller-profile?onboarding=1" passHref>
                  <Button className={styles.postForm__paperTopRowBackButton}>
                    <ArrowBackIcon />
                  </Button>
                </NextLink>
              ) : null}

              <div className={styles.postForm__paperTopRowStepperContainer}>
                <Stepper
                  className={`${wide} ${styles.postForm__paperTopRowStepper}`}
                  activeStep={activeStep}
                >
                  {steps.map(({ label }, index) => (
                    <Step key={`${label}`}>
                      <StepLabel
                        StepIconComponent={StepIcon}
                        onClick={() =>
                          index < activeStep && setActiveStep(index)
                        }
                        style={index < activeStep ? { cursor: 'pointer' } : {}}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <Stepper
                  className={`${narrow} ${styles.postForm__paperTopRowStepper}`}
                  activeStep={activeStep}
                  alternativeLabel
                >
                  {steps.map(({ label }, index) => (
                    <Step key={`${label}`}>
                      <StepLabel
                        StepIconComponent={StepIcon}
                        onClick={() =>
                          index < activeStep && setActiveStep(index)
                        }
                        style={index < activeStep ? { cursor: 'pointer' } : {}}
                      />
                    </Step>
                  ))}
                </Stepper>
              </div>
            </div>

            {!error?.message ? null : (
              <Typography variant="body1" color="error" component="div">
                {error?.message}
              </Typography>
            )}

            {activeStep === 0 ? (
              <>
                <div className={styles.postForm__paperTitles}>
                  <Typography variant="h5">
                    Let&apos;s Post Your Service Profile
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Fill in the details below to get started on your new service
                    post.
                  </Typography>
                </div>

                <div className={styles.postForm__paperInputCluster}>
                  <Grid className={styles.postForm__contentCategoriesList}>
                    {categories.map((cat) => (
                      <Box
                        key={cat.id}
                        onClick={() => {
                          setSubCategoryId('')
                          setCategoryId(cat.id)
                        }}
                      >
                        <FormCard item={cat} selectedItem={category_id} />
                      </Box>
                    ))}
                  </Grid>
                  <FormButton
                    disabled={loading || !category_id}
                    setActiveStep={setActiveStep}
                    stepsCount={steps.length}
                    onFinish={_onFinish}
                  />
                </div>
              </>
            ) : activeStep === 1 ? (
              <>
                <div className={styles.postForm__paperTitles}>
                  <Typography variant="h5">
                    Let&apos;s Select a Sub-Category
                  </Typography>
                </div>

                <div className={styles.postForm__paperInputCluster}>
                  {category_id && (
                    <Grid className={styles.postForm__contentCategoriesList}>
                      {categories
                        .find((c) => c.id === category_id)
                        ?.sub_categories.map((sub) => (
                          <Box
                            key={sub.id}
                            onClick={() => {
                              setSubCategoryId(sub.id)
                            }}
                          >
                            <FormCard
                              item={sub}
                              selectedItem={sub_category_id}
                            />
                          </Box>
                        ))}
                    </Grid>
                  )}
                  <FormButton
                    disabled={loading || !category_id || !sub_category_id}
                    setActiveStep={setActiveStep}
                    stepsCount={steps.length}
                    onFinish={_onFinish}
                  />
                </div>
              </>
            ) : activeStep === 2 ? (
              <>
                <Breadcrumbs separator="›" aria-label="breadcrumb">
                  <Typography variant="h4">
                    {categories.find((c) => c.id === category_id)?.name}
                  </Typography>
                  <Typography variant="h4">
                    {
                      categories
                        .find((c) => c.id === category_id)
                        ?.sub_categories.find((c) => c.id === sub_category_id)
                        ?.name
                    }
                  </Typography>
                </Breadcrumbs>
                <div
                  className={`${styles.postForm__paperTitles} ${styles.postForm__wide}`}
                >
                  <Typography variant="h5">
                    Let your clients know about your service
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Fill in the details below to get started on your new service
                    post.
                  </Typography>
                </div>

                <div
                  className={`${styles.postForm__paperInputCluster} ${styles.postForm__wide}`}
                >
                  <FormControl fullWidth>
                    <TextField
                      label="Post Title"
                      aria-label="Post Title"
                      size="medium"
                      variant="outlined"
                      required
                      disabled={loading}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </FormControl>

                  <ReactQuill
                    placeholder="Write a short description of your service"
                    modules={modules}
                    readOnly={loading}
                    value={detail}
                    onChange={(text) => setDetail(text)}
                  />

                  <>
                    <Typography variant="h6" component="div">
                      Attachments:
                    </Typography>

                    {!attachment_files.length ? (
                      <Typography
                        variant="body2"
                        component="div"
                        color="textSecondary"
                      >
                        No attachments uploaded yet.
                      </Typography>
                    ) : (
                      attachment_files.map((file, i) => (
                        <div key={file.id}>
                          <Typography
                            variant="body2"
                            component="div"
                            color="textPrimary"
                          >
                            {i + 1}. {file.name || 'File'}{' '}
                            <Button
                              href={file.url}
                              download={file.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="text"
                              size="small"
                              disabled={loading}
                            >
                              <Typography
                                variant="body2"
                                component="div"
                                color="primary"
                              >
                                PREVIEW
                              </Typography>
                            </Button>{' '}
                            <Button
                              variant="text"
                              size="small"
                              disabled={loading}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to remove ${file.name}?`
                                  )
                                ) {
                                  setAttachmentFiles((prev) =>
                                    prev.filter((f) => f.id !== file.id)
                                  )
                                }
                              }}
                            >
                              <Typography
                                variant="body2"
                                component="div"
                                color="textSecondary"
                              >
                                REMOVE
                              </Typography>
                            </Button>
                          </Typography>
                        </div>
                      ))
                    )}

                    {uploadError?.message ? (
                      <Typography variant="body2" component="div" color="error">
                        Error: {uploadError.message}
                      </Typography>
                    ) : null}

                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      disabled={loading || uploading}
                      startIcon={
                        uploading ? <CircularProgress size={16} /> : <AddIcon />
                      }
                      onClick={() => setIsUploadDialogOpen(true)}
                    >
                      {uploading ? 'Uploading…' : 'Upload'}
                    </Button>
                    <DropzoneDialog
                      open={isUploadDialogOpen}
                      onSave={(files) => {
                        handleUpload(files)
                        setIsUploadDialogOpen(false)
                      }}
                      filesLimit={
                        (categories
                          .map((c) => c.sub_categories)
                          .flat()
                          .find((sc) => sc.id === sub_category_id)
                          ?.max_post_images || 10) - attachment_files.length
                      }
                      maxFileSize={5000000}
                      useChipsForPreview={true}
                      previewText="Selections:"
                      onClose={() => setIsUploadDialogOpen(false)}
                      submitButtonText="Upload"
                    />
                  </>

                  {user.business_size !== 'NATIONAL_BUSINESS' ? (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!is_local}
                          onChange={(e) => setIsLocal(!e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Make this post available nationally"
                    />
                  ) : null}

                  <FormButton
                    disabled={loading || !title || !detail || uploading}
                    setActiveStep={setActiveStep}
                    stepsCount={steps.length}
                    onFinish={_onFinish}
                  />
                </div>
              </>
            ) : activeStep === 3 ? (
              <>
                <Breadcrumbs separator="›" aria-label="breadcrumb">
                  <Typography variant="h4">
                    {categories.find((c) => c.id === category_id)?.name}
                  </Typography>
                  <Typography variant="h4">
                    {
                      categories
                        .find((c) => c.id === category_id)
                        ?.sub_categories.find((c) => c.id === sub_category_id)
                        ?.name
                    }
                  </Typography>
                </Breadcrumbs>
                <div
                  className={`${styles.postForm__paperTitles} ${styles.postForm__wide}`}
                >
                  <Typography variant="h5">
                    Enter amount of money you charge
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Fill in the details below to get started on your new service
                    post.
                  </Typography>
                </div>

                <div
                  className={`${styles.postForm__paperInputCluster} ${styles.postForm__wide}`}
                >
                  {prices.map((price, i) => (
                    <FormControl key={i} fullWidth>
                      <TextField
                        className={styles.postForm__pricingInputPrice}
                        label="Price ($/hr)"
                        aria-label="Price ($/hr)"
                        size="medium"
                        variant="outlined"
                        required
                        disabled={loading}
                        value={price.price.toString()}
                        onChange={(e) => {
                          const newPrices = [...prices]
                          newPrices[i].price = Number(e.target.value)
                          setPrices(newPrices)
                        }}
                      />
                      <TextField
                        className={styles.postForm__pricingInputDetail}
                        multiline
                        label="Describe your pricing (optional)"
                        aria-label="Describe your pricing (optional)"
                        size="medium"
                        variant="filled"
                        disabled={loading}
                        value={price.detail.toString()}
                        onChange={(e) => {
                          const newPrices = [...prices]
                          newPrices[i].detail = e.target.value
                          setPrices(newPrices)
                        }}
                      />
                      {prices.length > 1 ? (
                        <Button
                          className={styles.postForm__pricingInputRemoveButton}
                          size="small"
                          disabled={loading}
                          onClick={() => {
                            const newPrices = [...prices]
                            newPrices.splice(i, 1)
                            setPrices(newPrices)
                          }}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </FormControl>
                  ))}

                  <Button
                    color="primary"
                    size="small"
                    disabled={loading}
                    onClick={() =>
                      setPrices((prev) => [...prev, { price: 0, detail: '' }])
                    }
                    startIcon={<AddCircleOutlineIcon />}
                  >
                    Add Additional Prices
                  </Button>

                  <span />

                  <FormControl fullWidth>
                    <TextField
                      type="Number"
                      label="Years of Paid Experience"
                      aria-label="Years of Paid Experience"
                      size="medium"
                      variant="outlined"
                      disabled={loading}
                      value={years_of_experience}
                      onChange={(e) =>
                        setYearsOfExperience(
                          e.target.value ?? null ? Number(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>

                  <FormButton
                    disabled={loading || prices.length < 1}
                    setActiveStep={setActiveStep}
                    stepsCount={steps.length}
                    onFinish={_onFinish}
                  />
                </div>
              </>
            ) : null}
            {activeStep > 3 ? (
              <>
                <Breadcrumbs separator="›" aria-label="breadcrumb">
                  <Typography variant="h4">
                    {categories.find((c) => c.id === category_id)?.name}
                  </Typography>
                  <Typography variant="h4">
                    {
                      categories
                        .find((c) => c.id === category_id)
                        ?.sub_categories.find((c) => c.id === sub_category_id)
                        ?.name
                    }
                  </Typography>
                </Breadcrumbs>
                {steps[4].data.map((step: any) => {
                  return (
                    <>
                      <Grid container>
                        {step?.possible_values?.map((item: any) => (
                          <>
                            <Grid item sm={12}>
                              <h3>{item?.display_name}</h3>
                            </Grid>
                            <Grid item sm={12} md={12}>
                              {item.values.map((s: any) => {
                                const arr = s.values ?? []
                                return (
                                  <>
                                    <Typography variant="h5">
                                      {s?.display_name}
                                    </Typography>
                                    {arr.map((arri: InputElementsType) => (
                                      <InputElements
                                        prop={arri}
                                        handleChange={handleChange}
                                        parent={step.name}
                                        key={arri.label}
                                        attributes={attributes}
                                      />
                                    ))}

                                    <Divider
                                      component="hr"
                                      variant="fullWidth"
                                      style={{
                                        width: '60%',
                                        margin: '30px auto',
                                        height: '3px',
                                      }}
                                    />
                                  </>
                                )
                              })}
                            </Grid>
                          </>
                        ))}
                      </Grid>
                    </>
                  )
                })}

                <Grid container justifyContent="center">
                  <FormButton
                    disabled={loading || Object.values(attributes).length < 1}
                    setActiveStep={setActiveStep}
                    stepsCount={steps.length}
                    onFinish={_onFinish}
                  />
                </Grid>
              </>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ color: [] }, { background: [] }, { script: 'sub' }, { script: 'super' }],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link'],
    ['clean'],
  ],
}

export default PostForm
