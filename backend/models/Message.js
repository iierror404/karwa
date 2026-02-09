// backend/models/Message.js
import mongoose from 'mongoose';
import { CHAT_MESSAGE_TYPES } from '../utils/constants.js';

const messageSchema = new mongoose.Schema({
    route: { // الرسالة مرتبطة بيا خط؟
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    sender: { // منو دز الرسالة؟
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: { // لمنو رايحة؟
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: Object.values(CHAT_MESSAGE_TYPES),
        default: CHAT_MESSAGE_TYPES.TEXT
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;