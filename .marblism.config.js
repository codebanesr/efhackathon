module.exports = {
  getPagePathRelative: options => {
    const segments = options.route.replace(/^\//, '').split('/')

    let pathRelative = segments.map(segment => {
      let segmentRemix = segment

      if (segment.startsWith(':')) {
        segmentRemix = `$${segment.slice(1)}`
      }

      return segmentRemix
    })

    pathRelative = pathRelative.join('.')

    pathRelative = `${pathRelative}_/route.tsx`

    if (options.type === 'public') {
      pathRelative = `_public.${pathRelative}`
    }

    if (options.type !== 'public') {
      pathRelative = `_logged.${pathRelative}`
    }

    return '/' + pathRelative
  },

  LANDING: {
    isPage: options => {
      return options.pathRelative === '/app/routes/landing.tsx'
    },
    updatePagePathRelative: () => {
      return '/app/routes/_index.tsx'
    },
  },
}
