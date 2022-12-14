import React, { PureComponent, createRef } from 'react'
import PropTypes from 'prop-types'
import InfiniteScroller from 'react-infinite-scroller'

class InfiniteScroll extends PureComponent {
  ref = createRef()

  scrolltoTop = () => {
    const scroll = this.ref.current.getParentElement(this.ref.current.scrollComponent)
    scroll.scrollTop = 0
  }

  reset() {
    if (this.ref && this.ref.current) {
      this.ref.current.pageLoaded = this.ref.current.props.pageStart
      this.scrolltoTop()
    }
  }

  render() {
    return <InfiniteScroller ref={this.ref} key="scroller" {...this.props} />
  }
}

InfiniteScroll.defaultProps = {
  pageStart: 1
}

InfiniteScroll.propTypes = {
  pageStart: PropTypes.number
}

export default InfiniteScroll
