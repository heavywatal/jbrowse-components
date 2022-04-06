import { types, Instance, SnapshotIn } from 'mobx-state-tree'
import PluginManager from '@jbrowse/core/PluginManager'
import { ElementId } from '@jbrowse/core/util/types/mst'

const Job = types
  .model('Job', {
    name: types.string,
    statusMessage: types.maybe(types.string),
    progressPct: types.number,
  })
  .volatile(self => ({
    cancelCallback() {},
  }))
  .actions(self => ({
    setCancelCallback(cancelCallback: () => void) {
      self.cancelCallback = cancelCallback
    },
    setStatusMessage(message?: string) {
      self.statusMessage = message
    },
    setProgressPct(pct: number) {
      self.progressPct = pct
    },
  }))

interface NewJob extends SnapshotIn<typeof Job> {
  cancelCallback(): void
}

export default function f(pluginManager: PluginManager) {
  return types
    .model('JobsListModel', {
      id: ElementId,
      type: types.literal('JobsListWidget'),
      jobs: types.array(Job),
    })
    .actions(self => ({
      addJob(job: NewJob) {
        const { cancelCallback } = job
        const length = self.jobs.push(job)
        const addedJob = self.jobs[length - 1]
        addedJob.setCancelCallback(cancelCallback)
        return addedJob
      },
      updateJobStatusMessage(jobName: string, message?: string) {
        const job = self.jobs.find(job => job.name === jobName)
        if (!job) {
          throw new Error(`No job found with name ${jobName}`)
        }
        job.setStatusMessage(message)
      },
      updateJobProgressPct(jobName: string, pct: number) {
        const job = self.jobs.find(job => job.name === jobName)
        if (!job) {
          throw new Error(`No job found with name ${jobName}`)
        }
        job.setProgressPct(pct)
      },
    }))
}

export type JobsListStateModel = ReturnType<typeof f>
export type JobsListModel = Instance<JobsListStateModel>
