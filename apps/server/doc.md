
查看消息列表示例

查看消息列表 API 用于查询指定会话（conversation）中的消息记录，不仅包括开发者在会话中手动插入的每一条消息和用户发送的 Query，也包括调用发起对话 API 得到的 type=answer 的智能体回复，但不包括 type=function_call、tool_response 和 follow-up 类型的对话中间态消息。

请求示例
curl --location --request POST https://api.coze.cn/v1/conversation/message/list?&conversation_id=737363834493434**** \
--data-raw '{
    "limit": null,
    "order": "asc",
    "chat_id": "737363834493437****",
    "before_id": "737363834493437****"
}'

返回示例
{
    "code": 0,
    "data": [
        {
            "bot_id": "737363834493434****",
            "chat_id": "747363834493434****",
            "content": "你的名字叫什么",
            "content_type": "text",
            "conversation_id": "737363834493434****",
            "created_at": 1716809829,
            "id": "737363834493437****",
            "meta_data": {},
            "role": "user",
            "type": "",
            "updated_at": "1716809829"
        },
        {
            "bot_id": "737363834493434****",
            "chat_id": "747363834493434****",
            "content": "我的名字叫bot",
            "content_type": "text",
            "conversation_id": "737363834493434****",
            "created_at": "1716809829",
            "id": "737363834493440****",
            "meta_data": {},
            "role": "assistant",
            "type": "",
            "updated_at": "1716936779"
        }
    ],
    "first_id": "737363834493437****",
    "has_more": true,
    "last_id": "737363834493440****",
    "msg": "",
    "detail": {
        "logid": "20250106172024B5F607030EFFAD653960"
    }

}


查看会话列表示例

请求示例
curl --location --request curl -X GET https://api.coze.cn/v1/conversations?bot_id=73428668*****&page_num=1&page_size=20 \
  -H "Authorization: Bearer pat_OYDacMzM3WyOWV3Dtj2bHRMymzxP****"

返回示例
{
  "code": 0,
  "msg": "",
  "data": {
    "has_more": false,
    "conversations": [
      {
        "created_at": 1731575569,
        "id": "12345***3456789",
      }
    ]
  },
  "detail": {
    "logid": "202412345678901234567890"
  }
}

流式响应示例

请求示例
curl --location --request POST 'https://api.coze.cn/v3/chat?conversation_id=7374752000116113452' \
--header 'Authorization: Bearer pat_OYDacMzM3WyOWV3Dtj2bHRMymzxP****' \
--header 'Content-Type: application/json' \
--data-raw '{
    "bot_id": "734829333445931****",
    "user_id": "123456789",
    "stream": true,
    "auto_save_history":true,
    "additional_messages":[
        {
            "role":"user",
            "content":"2024年10月1日是星期几",
            "content_type":"text"
        }
    ]
}'
响应示例
event:conversation.chat.created
// 在 chat 事件里，data 字段中的 id 为 Chat ID，即会话 ID。
data:{"id":"7382159487131697202","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","completed_at":1718792949,"last_error":{"code":0,"msg":""},"status":"created","usage":{"token_count":0,"output_count":0,"input_count":0}}

event:conversation.chat.in_progress
data:{"id":"7382159487131697202","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","completed_at":1718792949,"last_error":{"code":0,"msg":""},"status":"in_progress","usage":{"token_count":0,"output_count":0,"input_count":0}}

event:conversation.message.delta
data:{"id":"7382159494123470858","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"answer","content":"2","content_type":"text","chat_id":"7382159487131697202"}

event:conversation.message.delta
data:{"id":"7382159494123470858","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"answer","content":"0","content_type":"text","chat_id":"7382159487131697202"}

//省略模型回复的部分中间事件event:conversation.message.delta
......

event:conversation.message.delta
data:{"id":"7382159494123470858","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"answer","content":"星期三","content_type":"text","chat_id":"7382159487131697202"}

event:conversation.message.delta
data:{"id":"7382159494123470858","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"answer","content":"。","content_type":"text","chat_id":"7382159487131697202"}

event:conversation.message.completed
data:{"id":"7382159494123470858","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"answer","content":"2024 年 10 月 1 日是星期三。","content_type":"text","chat_id":"7382159487131697202"}

event:conversation.message.completed
data:{"id":"7382159494123552778","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","role":"assistant","type":"verbose","content":"{\"msg_type\":\"generate_answer_finish\",\"data\":\"\",\"from_module\":null,\"from_unit\":null}","content_type":"text","chat_id":"7382159487131697202"}

event:conversation.chat.completed
data:{"id":"7382159487131697202","conversation_id":"7381473525342978089","bot_id":"7379462189365198898","completed_at":1718792949,"last_error":{"code":0,"msg":""},"status":"completed","usage":{"token_count":633,"output_count":19,"input_count":614}}

event:done
data:"[DONE]"
