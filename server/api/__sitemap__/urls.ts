export default defineSitemapEventHandler(async () => {
  return [
    { loc: '/' },
    { loc: '/service' },
    { loc: '/about' },
    { loc: '/faq' },
    { loc: '/contact' },
  ]
})
