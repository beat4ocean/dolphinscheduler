/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRoute } from 'vue-router'
import { useAsyncState } from '@vueuse/core'
import { countWorkflowInstanceState } from '@/service/modules/projects-analysis'
import { format } from 'date-fns'
import { toLower } from 'lodash'
import { useI18n } from 'vue-i18n'
import type { WorkflowInstanceCountVo } from '@/service/modules/projects-analysis/types'
import type { StateData } from './types'
import { reactive, ref } from 'vue'

export function useWorkflowState() {
  const route = useRoute()
  const { t } = useI18n()
  const workflowVariables = reactive({
    workflowLoadingRef: ref(false)
  })

  const getWorkflowState = (date: Array<number>) => {
    if (workflowVariables.workflowLoadingRef) return
    workflowVariables.workflowLoadingRef = true
    const { state } = useAsyncState(
      countWorkflowInstanceState({
        startDate: !date ? '' : format(date[0], 'yyyy-MM-dd HH:mm:ss'),
        endDate: !date ? '' : format(date[1], 'yyyy-MM-dd HH:mm:ss'),
        projectCode: Number(route.params.projectCode)
      }).then((res: WorkflowInstanceCountVo): StateData => {
        const table = res.workflowInstanceStatusCounts.map((item, unused) => {
          return {
            state: t('home.' + toLower(item.state)),
            number: item.count
          }
        })

        const chart = res.workflowInstanceStatusCounts.map((item) => {
          return {
            value: item.count,
            name: t('home.' + toLower(item.state))
          }
        })
        workflowVariables.workflowLoadingRef = false

        return { table, chart }
      }),
      { table: [], chart: [] }
    )

    return state
  }

  return { getWorkflowState, workflowVariables }
}
