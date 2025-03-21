import { Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '644400074008297512',
})
async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      browse: 'general.browsing',
      viewHome: 'general.viewHome',
      searchFor: 'general.searchFor',
    },

  )
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

let strings: Awaited<ReturnType<typeof getStrings>>

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/Fandom/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Viewing an unsupported page',
    startTimestamp: browsingTimestamp,
  }
  const [showButtons, displaySearch, cover] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('displaySearch'),
    presence.getSetting<boolean>('cover'),
  ])
  const { hostname, href, search, pathname } = document.location
  const video = document.querySelector<HTMLVideoElement>('video')

  if (!strings)
    strings = await getStrings()

  switch (true) {
    case hostname === 'www.fandom.com': {
      switch (true) {
        case pathname === '/':
        case pathname === '': {
          presenceData.details = strings.viewHome
          break
        }
        case pathname.includes('fancentral/home'): {
          presenceData.details = 'Fancentral'
          presenceData.state = strings.viewHome
          break
        }
        case pathname.includes('/universe/') : {
          const universeTitle = document.querySelector('[class*="mainSection_canonicalName"]')?.textContent
          presenceData.details = `Viewing the ${universeTitle} universe`
          break
        }
        case pathname.includes('/topics/'): {
          presenceData.details = 'Browsing topic:'
          presenceData.state = document.querySelector('h1')?.textContent
          break
        }
        case pathname.includes('/articles/'): {
          if (video && !video.paused && !video.muted) {
            presenceData.details = 'Watching video:';
            [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
            presenceData.smallImageKey = Assets.Play
            presenceData.buttons = [
              {
                label: 'Watch Video',
                url: href,
              },
            ]
          }
          else {
            presenceData.details = 'Reading article:'

            presenceData.smallImageKey = Assets.Reading
            presenceData.buttons = [
              {
                label: 'Read Article',
                url: href,
              },
            ]
          }
          presenceData.state = document.querySelector('h1')?.textContent
          break
        }
      }
      break
    }
    case hostname === 'community.fandom.com': {
      presenceData.name = 'Fandom Community'
      switch (true) {
        case !!search && displaySearch: {
          presenceData.details = `${strings.searchFor} ${document.querySelector<HTMLInputElement>('[name="query"]')?.value ?? 'Unknown'}`
          presenceData.state = `In ${document.querySelector('.unified-search__profiles__profile--selected > span > span')?.textContent?.toLowerCase() ?? 'all sections'}`
          presenceData.smallImageKey = Assets.Search
        }
      }
      break
    }
    case hostname.includes('fandom.com'): {
      break
    }
    default: {
      return presence.setActivity(presenceData)
    }
  }

  if (presenceData.buttons && !showButtons)
    delete presenceData.buttons
  if (presenceData.largeImageKey !== ActivityAssets.Logo && !cover)
    presenceData.largeImageKey = ActivityAssets.Logo

  presence.setActivity(presenceData)
})
