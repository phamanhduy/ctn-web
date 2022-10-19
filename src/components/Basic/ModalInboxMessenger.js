import React from 'react';
import _ from 'lodash';
import { connect } from "react-redux";
import {
  Modal, Tooltip, Mentions, Icon,
  Col, Button, Divider, List, Typography, notification,
} from 'antd';

import { integration } from '../../_helpers/constant';
import { userConstants } from '../../_constants';
import { checkAdmin } from '../../_helpers/authorization';
import db from '../../common/db';

import EmojiPicker from "../../components/EmojiPicker";
// import { replyCommentFbPrivate } from '../../conversation-kit/actions';
const { Title } = Typography;

class ModalInboxMessenger extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      inProgress: false,
      isOpeningCanned: false,
      cannedMessages: null,
    };
    this.textArea = React.createRef();

    document.body.addEventListener('click', e => {
      if (!this.state.isOpeningCanned && _.isEmpty(this.state.cannedMessages)) {
        return;
      }
      const pathBubble = this.composedPath(e.target);
      let isOutsideOfCanned = true;
      pathBubble.forEach(target => {
        const className = _.get(target, 'className');
        if (!className || typeof className !== 'string') {
          return;
        }
        if (className.includes('inbox-canned-wrapper') || className.includes('canned-icon') || className.includes('reply-text-zone')) {
          isOutsideOfCanned = false;
        }
      });
      if (isOutsideOfCanned) {
        this.setState({
          cannedMessages: null,
          selectedCategory: null,
          viewedMessage: null,
        });
      }
    });
  }

  composedPath(element) {
    const path = [];
    while (element) {
      path.push(element);
      if (element.tagName === 'HTML') {
        return path;
      }
      element = element.parentElement;
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.conversation !== prevProps.conversation || this.props.messageId !== prevProps.messageId) {
      this.setState({
        text: '',
        inProgress: false,
        isOpeningCanned: false,
        selectedCategory: undefined,
      });
    }
  }

  onChangeText = value => {
    this.setState({ text: value.replace(/\s\s+/g, ' ') });
    if (!this.state.isOpeningCanned && /^\/[0-9a-zA-Z ]*$/.test(value)) {
      const messages = this.props.cannedMessages.filter(message => message.shortcut && message.shortcut.toLowerCase().indexOf(value.toLowerCase().slice(1)) === 0);
      this.setState({
        cannedMessages: messages,
        activeIndex: 0
      });
    } else {
      this.setState({
        cannedMessages: null
      });
    }
  }

  onSelectCannedCategory(category) {
    this.setState({
      selectedCategory: category,
    });
  }

  onChangeOpenCanned = () => {
    const { isOpeningCanned, inProgress } = this.state;
    if (inProgress) {
      return;
    }
    this.setState({
      isOpeningCanned: !isOpeningCanned,
    });
  }

  onSelectCannedMessage(message, isClear = true) {
    this.setState({
      text: isClear ? message.content : this.state.text + ' ' + message.content,
      cannedMessages: null,
      selectedCategory: null,
      viewedMessage: null,
      isOpeningCanned: false
    });
    this.focusTextArea();
  }

  onViewCannedMessage(message) {
    this.setState({
      viewedMessage: message
    });
  }

  focusTextArea() {
    if (this.textArea && this.textArea.current) {
      this.textArea.current.focus();
    }
  }

  renderCannedRecommended = () => {
    const activeMessage = _.get(this.state.cannedMessages, this.state.activeIndex);
    return (
      <List
        className='inbox-canned-wrapper scrollable'
        size="large"
        dataSource={this.state.cannedMessages}
        renderItem={message => (
          <List.Item
            className={message._id === _.get(activeMessage, '_id') ? 'inbox-canned-item active' : 'inbox-canned-item'}
            onClick={() => this.onSelectCannedMessage(message)}
          >
            <Col className='canned-shortcut' span={4}>/{message.shortcut}</Col>
            <Col className='canned-main' span={14}>
              <p className='highlighted'>{message.title}</p>
              <p>{message.content}</p>
            </Col>
            <Col className='canned-category' span={6}>
              {
                _.get(message, 'cannedCategory.sharedWith') === 'myself' ?
                  <img src='/images/folder-private.svg' /> :
                  <img src='/images/folder-shared.svg' />
              }
              <div>
                <p className='category-title' style={{ top: 4 }}>{_.get(message, 'cannedCategory.title')}</p>
              </div>
            </Col>
          </List.Item>
        )}
      />
    );
  }

  renderCannedCategory = (category) => {
    return (
      <Col className='canned-category' span={23}>
        {
          category.sharedWith === 'myself' ?
            <img src='/images/folder-private.svg' /> :
            <img src='/images/folder-shared.svg' />
        }
        <div>
          <p className='category-title highlighted'>{category.title}</p>
          <p>{_.filter(this.props.cannedMessages, message => message.category === category._id).length} tin nhắn</p>
        </div>
      </Col>
    );
  }

  renderCannedCategoryList = () => {
    return (
      <List
        className='inbox-canned-wrapper scrollable'
        size="large"
        dataSource={this.props.cannedCategories}
        renderItem={category => (
          <List.Item className='inbox-canned-item canned-category-item' onClick={() => this.onSelectCannedCategory(category)}>
            {
              this.renderCannedCategory(category)
            }
            <Button className='btn-edit' icon='down' />
          </List.Item>
        )}
      />
    );
  }

  renderCannedMessageList = () => {
    const messages = this.props.cannedMessages.filter(message => message.category === this.state.selectedCategory._id);
    return (
      <div className='inbox-canned-wrapper'>
        <div className='canned-message-list'>
          <div className='inbox-canned-item canned-category-item' onClick={() => this.onSelectCannedCategory(null)} >
            {
              this.renderCannedCategory(this.state.selectedCategory)
            }
            <Button className='btn-edit' icon='up' />
          </div>
          <Divider />
          <div className='list-wrapper'>
            <List
              size="large"
              dataSource={messages}
              renderItem={message => (
                <List.Item className='inbox-canned-item canned-category-item'>
                  <Col className='canned-shortcut' span={3}>/{message.shortcut}</Col>
                  <Col className='canned-main' span={16}>
                    <p className='highlighted'>{message.title}</p>
                    <p>{message.content}</p>
                  </Col>
                  <Col className='canned-option' span={5}>
                    <Button className='message-detail' icon='eye' onClick={() => this.onViewCannedMessage(message)}></Button>
                    <Button className='message-select' icon='plus' type='primary' onClick={() => this.onSelectCannedMessage(message, false)}></Button>
                  </Col>
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>
    );
  }

  renderCanned = () => {
    if (!this.state.isOpeningCanned && !_.isEmpty(this.state.cannedMessages)) {
      return this.renderCannedRecommended();
    }
    if (this.state.isOpeningCanned && !this.state.selectedCategory) {
      return this.renderCannedCategoryList();
    }
    if (this.state.isOpeningCanned && this.state.selectedCategory && !this.state.viewedMessage) {
      return this.renderCannedMessageList();
    }
    if (this.state.isOpeningCanned && this.state.viewedMessage) {
      return this.renderMessageDetails();
    }
    return <div></div>;
  }

  renderMessageDetails = () => {
    return (
      <div className='inbox-canned-wrapper'>
        <div className='canned-message-details'>
          <div className='message-header'>
            <Col span={22} style={{ position: 'relative' }}>
              <Button icon='left' onClick={() => this.onViewCannedMessage(null)}></Button>
              <span>{this.state.viewedMessage.title}</span>
            </Col>
            <Col span={2} style={{ textAlign: 'right' }}>
              <Button className='message-select' icon='plus' type='primary' onClick={() => this.onSelectCannedMessage(this.state.viewedMessage, false)} />
            </Col>
          </div>
          <Divider />
          <p>{this.state.viewedMessage.content}</p>
        </div>
      </div>
    );
  }

  sendSuccess = () => {
    notification.success({
      icon: <img src='/images/icon-success.svg' />,
      message: 'Gửi thành công',
      description: `Gửi tin nhắn tới ${this.props.authorName} thành công`,
    });
  }

  sendFail = () => {
    notification.error({
      icon: <img src='/images/icon-failed.svg' />,
      message: 'Gửi không thành công',
      description: `Đã có lỗi trong quá trình gửi tin nhắn tới ${this.props.authorName}`,
    });
  }

  handleOk = () => {
    const { messageId } = this.props;
    const { inProgress, text } = this.state;
    if (inProgress || _.isEmpty(text)) {
      return;
    }
    this.setState({ inProgress: true }, () => {
      if (!messageId) {
        return;
      }
      this.props.replyCommentFbPrivate(messageId, text)
        .then(() => {
          this.setState({ inProgress: false, text: '' }, () => {
            this.onCancel();
            this.sendSuccess();
          });
        }).catch(() => {
          this.setState({ inProgress: false }, () => {
            this.onCancel();
            this.sendFail();
          });
        });
    });
  }

  onCancel = () => {
    if (this.state.inProgress) {
      return;
    }
    this.props.close();
  }

  selectEmoji = char => {
    const textArea = _.get(this.textArea, 'current.rcMentions.textarea');
    if (!textArea) {
      return;
    }
    const { selectionStart, selectionEnd, value } = textArea;
    const newValue = value.substring(0, selectionStart) + char + value.substring(selectionEnd, value.length);
    this.setState({
      text: newValue,
    });
    textArea.focus();
    this._updateCursorPosition(selectionStart, char.length);
  }

  _updateCursorPosition(current, offset) {
    const textArea = _.get(this.textArea, 'current.rcMentions.textarea');
    if (!textArea) {
      return;
    }
    setTimeout(() => {
      textArea.selectionStart = current + offset;
      textArea.selectionEnd = current + offset;
    });
  }

  render() {
    const { text, inProgress } = this.state;
    const { visible, isIntegratedPageMessenger, authorName } = this.props;
    if (!isIntegratedPageMessenger) { //check is integrated messenger
      return this.renderNeedIntegrateMessenger(visible);
    }
    return (
      <Modal
        className='modal-inbox-messenger'
        title={
          <div>
            <img src='/images/icon-messenger-white.svg' alt='icon-messenger-white' />
                Gửi tin nhắn tới {authorName}
          </div>
        }
        visible={visible}
        keyboard={false}
        okText={
          inProgress
            ? <span><Icon type='loading' />Đang gửi</span>
            : <span>Gửi tin</span>}
        cancelText='Hủy'
        onOk={this.handleOk}
        onCancel={this.onCancel}
      >
        <div className='body-input'>
          <span style={{ color: '#8992A4' }}>*Bạn chỉ có thể gửi 1 tin nhắn cho khách hàng từ đây.</span>
          <div className={`textarea-message${inProgress ? ' sending-message' : ''}`}>
            {this.renderCanned()}
            <Mentions
              ref={this.textArea}
              disabled={inProgress}
              rows={10}
              placeholder='Shift +Enter để xuống dòng; Gõ ‘/’ để chọn các mẫu câu trả lời có sẵn'
              value={text}
              onChange={this.onChangeText}
            />
            <div className='sub-textarea'>
              <div className='sub-textarea-icon'>
                <Tooltip title='Tin nhắn mẫu' onClick={this.onChangeOpenCanned} placement='top'>
                  <Button className='btn-sub-textarea'>
                    <img src="/images/icon-canned-message.svg" alt='canned-message' />
                  </Button>
                </Tooltip>
                <EmojiPicker
                  buttonClassName="btn-sub-textarea"
                  onSelect={this.selectEmoji}
                  disabled={inProgress} />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  renderNeedIntegrateMessenger = visible => {
    return (
      <Modal
        className='modal-need-integrate'
        visible={visible}
        width={600}
        onOk={this.onCancel}
        onCancel={this.onCancel}
        footer={null}>
        <div className='element-modal'>
          <Title level={4}>Ứng dụng chưa tích hợp Facebook Messenger</Title>
          <div style={{ width: '437px', margin: 'auto', paddingTop: '5px' }}>
            <span>Tính năng gửi tin nhắn chỉ thực hiện được khi ứng dụng đã tích hợp Facebook Messenger</span>
          </div>
        </div>
        <div className='element-modal'>
          <img src='/images/integration/integrate-messenger.svg' alt='need-integrate-messenger' />
        </div>
        {
          checkAdmin()
            ? <div className='element-modal'>
              <Button type='primary' onClick={() => {
                this.props.redirect({ redirectTo: `/app/${this.props.app._id}/connect/facebook/messenger` });
              }}>Tích hợp Facebook Messenger ngay</Button>
              <Button onClick={this.onCancel}>Để sau</Button>
            </div>
            : <div className='element-modal'>
              <span style={{ color: '#222' }}>Hãy liên hệ với admin của ứng dụng về tính năng này</span>
            </div>
        }
      </Modal>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const messageTable = db.getTable(state, db.tableNames.messages);
  const message = db.get(messageTable, ownProps.messageId);
  const integrationIdConv = _.get(ownProps, 'conversation.appIntegrationId');
  const isConversationFacebookComment = ownProps.isConversationFacebookComment;
  const appIntegration = isConversationFacebookComment
    ? _.find(state.integrations[integration.appType.FACEBOOK_COMMENT], { _id: integrationIdConv, active: true, deleted: false })
    : _.find(state.integrations[integration.appType.FACEBOOK_MESSENGER], { _id: integrationIdConv, active: true, deleted: false });
  const isIntegratedPageMessenger = !isConversationFacebookComment ? !_.isEmpty(appIntegration)
    : !_.isEmpty(_.find(state.integrations[integration.appType.FACEBOOK_MESSENGER], {
      typeId: _.get(appIntegration, 'typeId'), active: true, deleted: false,
    })); // check integrated messenger for current page
  const ownCategories = _.get(state.cannedMessage, 'ownCategories') || [];
  const sharedCategories = _.get(state.cannedMessage, 'sharedCategories') || [];
  const cannedCategories = ownCategories.concat(sharedCategories);
  const cannedMessages = _.map(_.get(state.cannedMessage, 'messages'), message => {
    message.cannedCategory = cannedCategories.find(category => category._id === message.category);
    return message;
  });
  return {
    app: state.common.app,
    cannedCategories,
    cannedMessages,
    isIntegratedPageMessenger,
    authorName: _.get(message, 'author.name'),
  };
};

const mapDispatchToProps = dispatch => ({
  redirect: payload => dispatch({ type: userConstants.REDIRECT_TO, payload }),
  // replyCommentFbPrivate: (messageId, text) => dispatch(replyCommentFbPrivate(messageId, text)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalInboxMessenger);