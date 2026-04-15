export default defineNuxtPlugin((nuxtApp) => {
  const originalConsoleWarn = console.warn.bind(console)
  const previousWarnHandler = nuxtApp.vueApp.config.warnHandler

  console.warn = (...args: unknown[]) => {
    const [firstArg] = args

    if (
      typeof firstArg === 'string' &&
      firstArg.includes('<Suspense> is an experimental feature and its API will likely change.')
    ) {
      return
    }

    originalConsoleWarn(...args)
  }

  nuxtApp.vueApp.config.warnHandler = (msg, instance, trace) => {
    if (
      typeof msg === 'string' &&
      msg.includes('<Suspense> is an experimental feature and its API will likely change.')
    ) {
      return
    }

    if (previousWarnHandler) {
      previousWarnHandler(msg, instance, trace)
      return
    }

    originalConsoleWarn(msg + (trace ?? ''))
  }
})
