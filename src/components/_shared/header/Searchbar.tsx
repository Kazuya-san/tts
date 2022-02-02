import { TreeSelect } from 'antd'
import 'antd/dist/antd.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
// utils
import axios from '../../../utils/axiosHelper/axios'
import { useCity } from '../../../utils/city/city-context'
import processDuplicates from '../../../utils/processDuplicates/processDuplicates'
import styles from './header.module.scss'

// ----------------------------------------------------------------------

export default function Searchbar(props: any) {
  const router = useRouter()
  const { zipAndCity } = useCity(false)

  const [term, setTerm] = useState(props.q)
  let [treeData, setTreeData] = useState<any>([])
  let structureTreeData = (data: any, parentKey: any = '') => {
    // debugger
    if (typeof data === 'string') {
      return {
        title: data.toString(),
        value: data.toString(),
        key: data.toString() + parentKey,
      }
    } else if (Array.isArray(data) && data[0] !== true) {
      let r: any[] = []
      data.forEach((item) => {
        r.push({
          title: item,
          value: item,
          key: item + parentKey,
        })
      })
      return r
    } else if (typeof data === 'object' && data !== [true]) {
      let r: any[] = []
      Object.keys(data).map((item) => {
        if (typeof data[item] === 'string') {
          r.push({
            title: item.toString(),
            value: item.toString(),
            key: item + parentKey,
            children: [structureTreeData(data[item], item)],
          })
        } else if (Array.isArray(data[item]) && data[item][0] === true) {
          r.push({
            title: item.toString(),
            value: item.toString(),
            key: item + parentKey,
          })
        } else {
          r.push({
            title: item.toString(),
            value: item.toString(),
            key: item + parentKey,
            children: structureTreeData(data[item], item),
          })
        }
      })
      return r
    } else {
      console.log('Another case: ', typeof data)
    }
  }

  let getAutoCompleteOptions = async (searchText: any) => {
    try {
      let response = await axios.post('/search', { searchText })

      let { search_all_post_category_possible_value_tags = [] } = response.data
      let autocompletetags = processDuplicates(
        search_all_post_category_possible_value_tags
      )

      setTreeData(structureTreeData(autocompletetags))
    } catch (error) {
      console.log(error)
    }
  }

  const handleSearch = (searchText: any) => {
    if (!zipAndCity || !searchText) {
      return
    }

    router.push(
      `/posts/${zipAndCity.city.name.toLowerCase()}/${
        zipAndCity.city.alt_id
      }/${encodeURIComponent(searchText?.toLowerCase())}/1`
    )
  }

  const onChange = (value: any, label: any, extra: any) => {
    setTerm(value)
    handleSearch(value)
  }

  const onSearch = (value: any) => {
    setTerm(value)
  }

  useEffect(() => {
    if (term?.length > 3) {
      getAutoCompleteOptions(term)
    }
  }, [term])

  return (
    <TreeSelect
      size="large"
      showSearch
      treeLine
      style={{
        width: '100%',
        borderRadius: '18px',
        borderColor: 'transparent',
        backgroundColor: 'white'
      }}
      value={term}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      placeholder="Search ..."
      allowClear
      treeDefaultExpandAll
      onChange={onChange}
      onSearch={onSearch}
      treeData={treeData}
      className={styles.header__search}
      bordered={false}
    />
  )
}
