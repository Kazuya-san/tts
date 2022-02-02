import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Chip,
  Box,
} from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import React, { useState } from 'react'
import Filters from 'bad-words'

interface TEXTFIELD {
  label: string
  placeholder: string
  type: 'TEXTFIELD'
}

interface SELECT {
  label: string
  placeholder: string
  type: 'SELECT'
  options: string[]
}
interface CHECKBOX {
  label: string
  type: 'CHECKBOX'
  options: string[]
}
interface SWITCH {
  label: string
  type: 'BOOLEAN'
  children?: SELECT
}

export type InputElementsType = TEXTFIELD | SELECT | CHECKBOX | SWITCH

const InputElements = ({
  prop,
  handleChange,
  parent,
  attributes,
}: {
  prop: InputElementsType
  attributes: any
  handleChange: (
    value: any,
    name: string,
    parent: string,
    children?: string
  ) => void
  parent: string
}): JSX.Element => {
  const [checkboxOpen, setCheckboxOpen] = useState(false)
  const filter = new Filters()

  const getDefaultValue = (type: string, param?: any) => {
    attributes
    if (type === 'TEXTFIELD') {
      const child =
        attributes && attributes[parent]
          ? attributes[parent][prop.label]
          : undefined
      return child
    } else if (type === 'CHECKBOX') {
      const child =
        attributes && attributes[parent] ? attributes[parent][param] : false
      return child ?? false
    } else if (type === 'BOOLEAN') {
      const child =
        attributes && attributes[parent]
          ? attributes[parent][prop.label]
          : false
      if (checkboxOpen !== child) setCheckboxOpen(child)
      return child
    }
  }

  return (
    <>
      {/* <Grid
        // container
        // justifyContent="flex-start"
        sm={12}
        lg={12}
        style={{ margin: 'auto', marginLeft: '16%', marginBottom: '30px' }}
      > */}
      <Box display="flex" flexDirection="row">
        {prop.label ? (
          <InputLabel
            style={{
              minWidth: '10vw',
              // textAlign: 'center',
              alignSelf: 'center',
              width: 'min-content',
              fontWeight: 500,
            }}
            variant="standard"
          >
            {prop.label}
          </InputLabel>
        ) : null}
        {prop.type === 'TEXTFIELD' && (
          <FormGroup>
            <Autocomplete
              multiple
              id="tags-filled"
              value={
                attributes?.[parent]?.[prop?.label]
                  ? attributes[parent][prop?.label]
                  : []
              }
              options={[]}
              freeSolo
              renderTags={(value: any, getTagProps: any) =>
                value.map((option: any, index: any) => (
                  <Chip
                    key={index}
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Others"
                  placeholder={prop.placeholder}
                  helperText="Write & Press Enter to add upto 3"
                />
              )}
              onChange={(event, newValue) => {
                if (
                  newValue.length <= 3 &&
                  !filter.isProfane(newValue[newValue.length - 1])
                )
                  handleChange(newValue, prop.label, parent)
              }}
            />
          </FormGroup>
        )}
        {prop.type === 'CHECKBOX' && (
          <FormGroup>
            <Box display="flex" flexDirection="row" flexWrap="wrap">
              <Grid container spacing={1}>
                {prop.options.map((option: string, index: number) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        color="primary"
                        defaultChecked={getDefaultValue(prop.type, option)}
                        onChange={(e: any) => {
                          handleChange(e.target.checked, option, parent)
                        }}
                      />
                    }
                    label={option}
                  />
                ))}
              </Grid>
            </Box>
          </FormGroup>
        )}
        {prop.type === 'SELECT' && (
          <Select
            onChange={(e) => {
              handleChange(e.target.value, prop.label, parent)
            }}
            value={
              attributes && attributes[parent] && attributes[parent][prop.label]
            }
            variant="standard"
            style={{ width: '200px' }}
          >
            {prop.options.map((option: string) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        )}
        {prop.type === 'BOOLEAN' && (
          <>
            <Switch
              color="primary"
              defaultChecked={getDefaultValue(prop.type)}
              onChange={(e) => {
                handleChange(
                  e.target.checked,
                  prop.label,
                  parent,
                  prop.children?.label
                )
                setCheckboxOpen(e.target.checked)
              }}
            />

            {checkboxOpen && prop.children && (
              <Select
                value={
                  // attributes &&
                  // attributes[parent] &&
                  // attributes[parent][prop.label]
                  attributes[parent][prop?.children?.label]
                }
                onChange={(e) => {
                  handleChange(e.target.value, prop.children!.label, parent)
                }}
                defaultValue={getDefaultValue(prop.type, prop.children.options)}
                variant="standard"
                style={{ width: '200px' }}
                placeholder={prop?.children?.label}
              >
                {prop.children.options.map((option: string) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            )}
          </>
        )}
      </Box>
      {/* </Grid> */}
    </>
  )
}
export default InputElements
