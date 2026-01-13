import Chat from "../models/chat.model";

interface SaveRes {
  type: "success" | "error";
  savedCId: string | null;
  msg: string;
  title: string | null;
}

export const Save = async (
  fId: string,
  user_query: string,
  generated: string,
  cId?: string | null
): Promise<SaveRes> => {
  try {
    if (!cId || cId === "null") {
      try {
        const newChat = new Chat({
          fuser: fId,
          title: user_query,
          conversation: [
            {
              isUser: true,
              message: user_query,
            },
            {
              isUser: false,
              message: generated,
            },
          ],
        });
        const chat = await newChat.save();
        return {
          type: "success",
          savedCId: chat._id.toString(),
          title: user_query,
          msg: "Chat saved successfully",
        };
      } catch (error) {
        console.log(error);
        return {
          type: "error",
          savedCId: null,
          title: null,
          msg: "Failed to save chat",
        };
      }
    }
    const chat = await Chat.findOne({ _id: cId, fuser: fId });
    if (!chat) {
      return {
        type: "error",
        savedCId: null,
        title: null,
        msg: "Chat not found",
      };
    }
    chat.conversation.push(
      {
        isUser: true,
        message: user_query,
      },
      {
        isUser: false,
        message: generated,
      }
    );
    await chat.save();

    return {
      type: "success",
      savedCId: chat._id.toString(),
      title: null,
      msg: "Chat updated successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      savedCId: null,
      title: null,
      msg: "Failed to save chat",
    };
  }
};