// import NextLink from 'next/link'
// import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
// import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft'
// import { Radio, RadioGroup } from '@material-ui/core'
import { TreeItem, TreeView } from '@material-ui/lab'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import FilterIcon from '../../assets/icons/filter.svg'
// import { theme } from '../../styles/theme'
import { useCity } from '../../utils/city/city-context'
import type { PostsProps } from './posts'
// import Link from '../_shared/link/link'
import styles from './posts.module.scss'

type PostsFiltersProps = PostsProps

// const useStyles = makeStyles({
//   allActionButton: {
//     margin: theme.spacing(-0.5, -1),
//     padding: theme.spacing(0.5, 1),

//     textTransform: 'initial',
//   },
//   categoryButton: {
//     padding: theme.spacing(1),

//     width: '100%',

//     textTransform: 'initial',
//   },
//   subCategoryLink: {
//     display: 'block',

//     textDecoration: 'none !important',
//   },
// })

function PostsFilters(props: PostsFiltersProps) {
  // const classes = useStyles()

  const [expanded, setExpanded] = useState<any>([])
  const [selected, setSelected] = useState<any>([])

  // const initiallyExpandedCategoryIds = useMemo(() => {
  //   let expandedCategoryIds: string[] = []

  //   Object.keys(props.categoryDetails).map((item, index) => {
  //     if (index === 0) {
  //       expandedCategoryIds.push(item)
  //     }
  //   })

  //   return expandedCategoryIds
  // }, [props.categoryDetails])
  // const [expandedCategoryIds, setExpandedCategoryIds] = useState<any[]>(
  //   initiallyExpandedCategoryIds
  // )

  useEffect(() => {
    console.log(props.categoryDetails)
    let foundTags = Object.keys(props.categoryDetails)
    setExpanded(foundTags)
  }, [props.categoryDetails])

  const { zipAndCity } = useCity()
  if (!zipAndCity) {
    return null
  }

  const useTreeItemStyles = makeStyles((theme) => ({
    content: {
      padding: '15px 10px',
      '@media and (min-width: 1280px) and (max-width: 1400px)': {
        padding: '15px 5px',
      },
    },
    labelRoot: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
    },
    labelIcon: {
      marginRight: theme.spacing(1),
    },
    labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
    },
  }))

  function TreeViewStructure({ categoryDetails, step }: any) {
    const classes = useTreeItemStyles()
    return (
      <>
        {Object.keys(categoryDetails).map((category, index) => (
          <>
            {Object.keys(categoryDetails[category]).length === 0 ? (
              <TreeItem
                key={category}
                nodeId={category}
                label={category}
                classes={{
                  content: classes.content,
                }}
              />
            ) : (
              <>
                {Array.isArray(categoryDetails[category]) &&
                categoryDetails[category]?.includes(true) ? (
                  <TreeItem
                    key={category}
                    nodeId={category}
                    label={category}
                    classes={{
                      content: classes.content,
                    }}
                  />
                ) : (
                  <TreeItem
                    key={category}
                    nodeId={category}
                    label={category}
                    classes={{
                      content: classes.content,
                    }}
                  >
                    {Object.keys(categoryDetails[category]).length === 0 ||
                    Array.isArray(categoryDetails[category]) ? (
                      <>
                        {Array.isArray(categoryDetails[category])
                          ? categoryDetails[category]?.map((item: any) => (
                              <TreeItem
                                key={item}
                                nodeId={item}
                                label={item}
                                classes={{
                                  content: classes.content,
                                }}
                              />
                            ))
                          : null}
                      </>
                    ) : (
                      <TreeViewStructure
                        categoryDetails={categoryDetails[category]}
                      />
                    )}
                  </TreeItem>
                )}
              </>
            )}
          </>
        ))}
      </>
    )
  }

  const handleToggle = (event: any, nodeIds: any) => {
    setExpanded(nodeIds)
  }

  const handleSelect = (event: any, nodeIds: any) => {
    setSelected(nodeIds)
    props.setFilterText(nodeIds)
  }

  return (
    <aside className={styles.posts__aside}>
      <div className={styles.post__filter_text_wrapper}>
        <div className={styles.post__filter_text}>
          <Image src={FilterIcon} alt="FilterIcon" />
          <span>Filter</span>
        </div>
        <div className={styles.post__filter_leftIcon}>
          <KeyboardArrowLeftIcon />
        </div>
      </div>

      <div
        style={{ backgroundColor: 'white' }}
        className={styles.posts__category}
      >
        <TreeView
          aria-label="controlled"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={expanded}
          selected={selected}
          onNodeToggle={handleToggle}
          onNodeSelect={handleSelect}
        >
          <TreeViewStructure categoryDetails={props.categoryDetails} step={1} />
        </TreeView>
      </div>
    </aside>
  )
}

export default PostsFilters
