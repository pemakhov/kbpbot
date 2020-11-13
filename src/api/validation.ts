import { Boolean, Number, String, Array, Record, Union, Undefined, Literal, Static } from 'runtypes';

const InlineKeyboardButtonRuntype = Union(
  Record({
    text: String,
    url: String,
  }),
  Record({
    text: String,
    login_url: Record({
      url: String,
      forward_text: String.Or(Undefined),
      bot_username: String.Or(Undefined),
    }),
  }),
  Record({
    text: String,
    callback_data: String,
  }),
  Record({
    text: String,
    switch_inline_query: String,
  }),
  Record({
    text: String,
    switch_inline_query_current_chat: String,
  })
  // Disabled on purpose options
  /*
  Record({
    text: String,
    callback_game: String,
  }),
  Record({
    text: String,
    pay: Boolean,
  })
  */
);

const KeyboardButtonRuntype = Union(
  Record({
    text: String,
    request_contact: Boolean,
  }),
  Record({
    text: String,
    request_location: Boolean,
  }),
  Record({
    text: String,
    request_poll: Record({
      // I didn't manage to make request_poll work
      type: Literal('quiz').Or(Literal('regular')).Or(Undefined),
    }),
  })
);

const ReplyMarkupRuntype = Union(
  Record({
    inline_keyboard: Array(Array(InlineKeyboardButtonRuntype)),
  }),
  Record({
    keyboard: Array(Array(KeyboardButtonRuntype)),
    resize_keyboard: Boolean.Or(Undefined),
    one_time_keyboard: Boolean.Or(Undefined),
    selective: Boolean.Or(Undefined),
  }),
  Record({
    remove_keyboard: Boolean.withConstraint((value) => value === true),
    selective: Boolean.Or(Undefined),
  }),
  Record({
    force_reply: Boolean.withConstraint((value) => value === true),
    selective: Boolean.Or(Undefined),
  })
);

const SendMessageOptionsRuntype = Record({
  caption: Undefined,
  parse_mode: Literal('MarkdownV2').Or(Literal('HTML')).Or(Undefined), // didn't add 'Markdown' as legacy
  disable_web_page_preview: Boolean.Or(Undefined),
  disable_notification: Boolean.Or(Undefined),
  reply_to_message_id: Number.Or(Undefined),
  reply_markup: ReplyMarkupRuntype.Or(Undefined),
});

const SendPhotoOptionsRuntype = Record({
  caption: String.Or(Undefined),
  parse_mode: Literal('MarkdownV2').Or(Literal('HTML')).Or(Undefined),
  disable_notification: Boolean.Or(Undefined),
  reply_to_message_id: Number.Or(Undefined),
  reply_markup: ReplyMarkupRuntype.Or(Undefined),
});

export const QueryRuntype = Union(
  Record({
    telegramId: String.Or(Undefined),
    telegramName: String.Or(Undefined),
    message: String,
    photo: String,
    options: Union(SendPhotoOptionsRuntype, Undefined),
  }),
  Record({
    telegramId: String.Or(Undefined),
    telegramName: String.Or(Undefined),
    message: String,
    photo: Undefined,
    options: Union(SendMessageOptionsRuntype, Undefined),
  }),
  Record({
    telegramId: String.Or(Undefined),
    telegramName: String.Or(Undefined),
    message: Undefined,
    photo: String,
    options: Union(SendPhotoOptionsRuntype, Undefined),
  })
);

export type Query = Static<typeof QueryRuntype> & { _stubField?: unknown };
