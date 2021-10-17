function doGet(){
    return HtmlService.createHtmlOutput("Service is running.");
}

function doPost(e){
  var body = JSON.parse(e.postData.contents);
  body.message.chat.id = body.message.chat.id + '';
  var payload = detect_message(body);
  var data = {
    "method": "post",
    "contentType": 'application/json',
    "payload": JSON.stringify(payload),
  }
  // 替换bot token
  // Replace bot token
  UrlFetchApp.fetch("https://api.telegram.org/botXXXXXXXXXXXXXXXX/", data);
}

// 格式化名字和姓氏
// Format first and last names
function getName(user) {
  var name = user.first_name;
  if (user.last_name) {
    name += " " + user.last_name;
  }
  return name;
}

// 字符转义
// Character escape
function escapeMarkDown(toEscapeMsg) {
  var escapedMsg = toEscapeMsg
  .replace(/_/g, "\\_")
  .replace(/\*/g, "\\*")
  .replace(/\[/g, "\\[")
  .replace(/`/g, "\\`");
    return escapedMsg;
}

// 获取名字
// Get the name
function getMentionName(user) {
  var username = user.username;
  var mentionName = "";
  var name = getName(user);
  if (!name) {
    name = "Anonymous";
  }
  mentionName = getMarkDownUserUrl(escapeMarkDown(name), user.id);
  return mentionName;
}

// Markdown语法输出名字
// Markdown syntax output name
function getMarkDownUserUrl(userName, userId) {
  return "[" + userName + "](tg://user?id=" + userId + ")";
}
 
 
function detect_message(body){
  // 进群操作
  // Join group action
  if (body.message.new_chat_member) {
    try {
      // 根据username移除用户（正则表达式语法）
      // Remove users based on username (regular expression syntax)
      if (body.message.from.username.match(/abc|claralouisa/g)) {
        var payload = {
          "method": "kickChatMember",
          "chat_id": body.message.chat.id,
          "user_id": body.message.new_chat_member.id,
        };
        return payload;
      }
    } catch (err) {}
    
    // 进群欢迎
    // Welcome to join group
    payload = {
      "method": "sendMessage",
      "chat_id": body.message.chat.id,
      "parse_mode": "Markdown",
      "disable_web_page_preview": true,
    }
    // 欢迎语
    // Welcome message
    payload.text = "Hello!" + getMentionName(body.message.new_chat_member) + ", Welcome to the group.";
    return payload;
  }
  
  // 退群操作
  // Quit group action
  if (body.message.left_chat_member) {
    payload = {
      "method": "sendMessage",
      "chat_id": body.message.chat.id,
      "parse_mode": "Markdown",
      "disable_web_page_preview": true,
    }
    // 退群消息
    // Quit group message
    payload.text = getMentionName(body.message.left_chat_member) + "Bye Bey!";
    return payload;
  }
  
  // 置顶消息
  // Pinned message
  if (body.message.pinned_message) {
    payload = {
      "method": "sendMessage",
      "chat_id": body.message.chat.id,
      "parse_mode": "Markdown",
      "disable_web_page_preview": true,
    }
    var whoPinned = getName(body.message.from);
    // var whoOwned = getName(body.message.pinned_message.from);
    payload.text = whoPinned + "Pinned message:\n\n" + body.message.pinned_message.text;
    return payload;
  }
  
  // 根据关键词删除信息（正则表达式语法）
  // Delete information based on keywords (regular expression syntax)
  if (body.message.text.match(/avc|abc/g)) {
    payload = {
      "method": "deleteMessage",
      "chat_id": body.message.chat.id,
      "message_id": body.message.message_id
    }
    return payload;
  }
}