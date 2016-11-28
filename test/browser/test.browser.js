/* globals chai, sinon */
const { assert } = chai

describe('map.js', () => {
  let locations
  let mockMap
  beforeEach(() => {
    locations = [{ meta: { omdb: {
      genres: ['GenreA', 'GenreB']
    }}}, { meta: { omdb: {
      genres: ['GenreB', 'GenreC']
    }}}]
    // mock the whole v3 API so we do not need to bother calling the real service
    mockMap = {
      controls: { LEFT_TOP: [] }
    }
    window.google = { maps: {
      Map: sinon.stub().returns(mockMap),
      Marker: sinon.stub().returns({
        addListener: sinon.spy()
      }),
      InfoWindow: sinon.spy(),
      ControlPosition: {
        LEFT_TOP: 'LEFT_TOP'
      }
    } }
    window.sf = { fetchLocations: () => Promise.resolve(locations) }
    return window.initMap()
  })

  afterEach(() => {
    delete window.google
    delete window.sf
  })

  it('should define global handler', () => {
    assert.isFunction(window.initMap)
  })

  it('should create Map after the lib is loaded', () => {
    sinon.assert.calledOnce(window.google.maps.Map)
  })

  it('should group and render all genres', () => {
    const genreElements = document.querySelectorAll('#genres-list label')
    assert.lengthOf(genreElements, 4, 'there should be 4 genres: 3 from movies + 1 "Show All"')
  })

  it('should render markers on the map', () => {
    sinon.assert.callCount(
      window.google.maps.Marker,
      locations.length,
      'there should be one Marker for each location'
    )
  })

  it('should render infoWindows', () => {
    sinon.assert.callCount(
      window.google.maps.InfoWindow,
      locations.length,
      'there should be one InfoWindow for each location'
    )
  })

  it('should create "Open Filters" button', () => {
    assert.lengthOf(mockMap.controls[window.google.maps.ControlPosition.LEFT_TOP], 1)
    const btn = mockMap.controls[window.google.maps.ControlPosition.LEFT_TOP][0]
    assert.instanceOf(btn, window.Element)
    assert.match(btn.nodeName, /button/i)
  })

  it('should open and close overlay', () => {
    const openBtn = mockMap.controls[window.google.maps.ControlPosition.LEFT_TOP][0]
    const closeBtn = document.getElementById('btn-close')
    const overlay = document.getElementById('overlay')
    const isOpen = () => overlay.classList.contains('open')
    assert.isFalse(isOpen(), 'overlay should be closed on startup')
    openBtn.click()
    assert.isTrue(isOpen(), 'overlay should be now open')
    closeBtn.click()
    assert.isFalse(isOpen(), 'overlay should be closed again')
  })
})
