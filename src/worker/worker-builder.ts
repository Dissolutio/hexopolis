export default class WorkerBuilder extends Worker {
  constructor(worker: () => void) {
    const code = worker.toString()
    super(code)
    const blob = new Blob([`(${code})()`])
    return new Worker(URL.createObjectURL(blob))
  }
}
