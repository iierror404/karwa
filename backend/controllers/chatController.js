import Message from '../models/Message.js';
import { getIO } from '../config/socket.js';
import { CHAT_MESSAGE_TYPES } from '../utils/constants.js';

/**
 * @desc ارسال رسالة جديدة
 * @route POST /api/chat/send
 */
export const sendMessage = async (req, res) => {
    try {
        const { routeId, receiverId, content, messageType } = req.body;
        const senderId = req.user._id; // ناخذه من التوكن (الكوكي) 🛡️

        const newMessage = new Message({
            route: routeId,
            sender: senderId,
            receiver: receiverId,
            content,
            messageType: messageType || CHAT_MESSAGE_TYPES.TEXT
        });

        await newMessage.save();

        // جلب بيانات المرسل (الاسم مثلاً) حتى تطلع بالشات فوراً
        const populatedMessage = await newMessage.populate('sender', 'Name profileImg');

        // ⚡ بث الرسالة عبر السوكيت للطرف الثاني
        const io = getIO();
        // نرسل الرسالة لغرفة الشات الخاصة بهذا الخط
        io.to(routeId.toString()).emit('new_message', populatedMessage);

        res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
      console.log("error in send Message controller: \n", error)
        res.status(500).json({ success: false, message: "مشكلة بالسيرفر"});
    }
};

/**
 * @desc جلب تاريخ المحادثة
 * @route GET /api/chat/history/:routerId
 */
export const getChatHistory = async (req, res) => {
    try {
        const { routeId } = req.params;
        
        // نجيب الرسايل الخاصة بهذا الخط والاشخاص المعنيين
        const messages = await Message.find({ route: routeId })
            .populate('sender', 'fullName profileImg')
            .sort({ createdAt: 1 }); // ترتيب من الأقدم للأحدث

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "فشل جلب الرسايل 📉" });
    }
};