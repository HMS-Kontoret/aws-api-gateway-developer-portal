// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react'
import { Link, Redirect } from 'react-router-dom'

// semantic-ui
import { Menu, Loader } from 'semantic-ui-react'

// store
import { observer } from 'mobx-react'
import { store } from 'services/state'

// utilities
import _ from 'lodash'
import Sidebar from 'components/Sidebar/Sidebar'
import SidebarHeader from 'components/Sidebar/SidebarHeader'
import MenuLink from 'components/MenuLink'

const stageOrder = ['prod', 'test', 'dev', 'proto']

function isKnownStage (stage) {
  return stageOrder.includes(stage)
}

function titleContainsStage (title) {
  const stagePart = title.substring(title.lastIndexOf('-') + 1)
  return isKnownStage(stagePart)
}

function getStageFromTitle (title) {
  if (titleContainsStage(title)) {
    return title.substring(title.lastIndexOf('-') + 1)
  }
}

function getStageFromTitleOrApi (api) {
  if (api.apiStage) {
    return api.apiStage
  } else if (titleContainsStage(api.swagger.info.title)) {
    return getStageFromTitle(api.swagger.info.title)
  }
}

function getTitleWithoutStage (api) {
  const title = api.swagger.info.title
  if (titleContainsStage(title)) {
    // Return the title without the stage suffix
    return title.substring(0, title.lastIndexOf('-'))
  }
  return title
}

// noinspection JSUnusedLocalSymbols
function getApisWithStages (selectedApiId, selectedStage, activateFirst) {
  const apiList = [].concat(_.get(store, 'apiList.generic', []), _.get(store, 'apiList.apiGateway', [])).map(api => ({
    group: getStageFromTitleOrApi(api) || api.id,
    id: api.apiStage || api.id,
    title: getTitleWithoutStage(api),
    route: `/apis/${api.id}` + (api.apiStage ? '/' + api.apiStage : ''),
    active: (
      (selectedApiId && (api.id === selectedApiId || api.apiId === selectedApiId)) &&
      (!selectedStage || getStageFromTitleOrApi(api) === selectedStage)
    ),
    stage: getStageFromTitleOrApi(api)
  }))

  const sortByStageOrder = stageOrder.reduce((obj, item, index) => {
    return {
      ...obj,
      [item]: index
    }
  }, {})

  // Sort the APIs by stage and title (stages have predetermined order: 'prod', 'test', 'dev' and 'proto')
  apiList.sort((first, second) => {
    if ((first.stage && second.stage) && (first.stage !== second.stage)) {
      if (isKnownStage(first.stage) && isKnownStage(second.stage)) {
        return sortByStageOrder[first.stage] - sortByStageOrder[second.stage]
      }
      return first.stage.localeCompare(second.stage)
    } else {
      return first.title.localeCompare(second.title)
    }
  })

  return _.toPairs(_.groupBy(apiList, 'group'))
    .map(([group, apis]) => ({ group, apis, active: _.some(apis, 'active'), title: apis[0].title }))
}

export default observer(function ApisMenu (props) {
  // If we're still loading, display a spinner.
  // If we're not loading, and we don't have any apis, display a message.
  // If we're not loading, and we have some apis, render the appropriate api subsections for apiGateway and generic apis
  if (!store.apiList.loaded) {
    return <Loader active />
  }

  const apiGroupList = getApisWithStages(
    props.activateFirst && props.path.params.apiId,
    props.path.params.stage,
    props.activateFirst
  )

  if (!apiGroupList.length) {
    return <p style={{ padding: '13px 16px', color: 'whitesmoke' }}>No APIs Published</p>
  }

  if (props.activateFirst && !props.path.params.apiId) {
    return <Redirect to={apiGroupList[0].apis[0].route} />
  }

  return (
    <Sidebar>
      <SidebarHeader
        as={Link}
        className='item'
        to='/apis/search'
        active={props.path.url === '/apis/search'}
        style={{ fontWeight: '400', fontSize: '1em' }}
      >
        Search APIs
      </SidebarHeader>

      <SidebarHeader>APIs</SidebarHeader>

      <>
        {apiGroupList.map(({ apis, group, active }) => (
          <MenuLink key={group} active={active} to={apis[0].stage ? null : apis[0].route}>
            {group}
            {apis[0].stage ? (
              <Menu.Menu>
                {apis.map(({ route, title, active, id }) => (
                  <MenuLink key={id} to={route} active={active} style={{ fontWeight: '400' }}>
                    {title}
                  </MenuLink>
                ))}
              </Menu.Menu>
            ) : null}
          </MenuLink>
        ))}
      </>
    </Sidebar>
  )
})
