import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FAQ.module.scss';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const faqData = [
        {
            question: 'Làm thế nào để đặt hàng?',
            answer: 'Bạn có thể đặt hàng trực tuyến qua website của chúng tôi bằng cách chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Hoặc gọi điện đến hotline 1900 1234 để được hỗ trợ đặt hàng.',
        },
        {
            question: 'Thời gian giao hàng là bao lâu?',
            answer: 'Thời gian giao hàng từ 2-5 ngày làm việc tùy thuộc vào khu vực. Với các đơn hàng trong nội thành, chúng tôi cam kết giao trong 24h.',
        },
        {
            question: 'Chính sách đổi trả như thế nào?',
            answer: 'Chúng tôi chấp nhận đổi trả trong vòng 30 ngày nếu sản phẩm còn nguyên vẹn, chưa qua sử dụng và còn đầy đủ hóa đơn. Các sản phẩm khuyến mãi có thể áp dụng chính sách khác.',
        },
        {
            question: 'Phương thức thanh toán nào được chấp nhận?',
            answer: 'Chúng tôi chấp nhận nhiều phương thức thanh toán: tiền mặt khi nhận hàng, chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ, và các ví điện tử phổ biến.',
        },
        {
            question: 'Làm sao để theo dõi đơn hàng?',
            answer: 'Sau khi đặt hàng thành công, bạn sẽ nhận được mã theo dõi đơn hàng qua email. Bạn có thể sử dụng mã này để tra cứu trạng thái đơn hàng trên website của chúng tôi.',
        },
        {
            question: 'Có miễn phí vận chuyển không?',
            answer: 'Chúng tôi miễn phí vận chuyển cho tất cả đơn hàng từ 500.000 VNĐ trở lên. Với đơn hàng dưới 500.000 VNĐ, phí vận chuyển là 30.000 VNĐ.',
        },
        {
            question: 'Sản phẩm hết hàng khi nào có lại?',
            answer: 'Thông thường các sản phẩm hết hàng sẽ được nhập lại trong vòng 7-14 ngày. Bạn có thể đăng ký nhận thông báo khi sản phẩm có hàng trở lại.',
        },
        {
            question: 'Có hỗ trợ mua hàng cho doanh nghiệp không?',
            answer: 'Có, chúng tôi có chính sách giá ưu đãi cho các đơn hàng số lượng lớn từ doanh nghiệp. Vui lòng liên hệ bộ phận kinh doanh để được tư vấn chi tiết.',
        },
    ];

    const filteredFaqs = faqData.filter(
        (item) =>
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Câu Hỏi Thường Gặp</h1>
                <p className={styles.subtitle}>Tìm kiếm câu trả lời cho những thắc mắc của bạn</p>

                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.content}>
                {filteredFaqs.length > 0 ? (
                    <div className={styles.accordion}>
                        {filteredFaqs.map((item, index) => (
                            <div key={index} className={styles.accordionItem}>
                                <button
                                    className={`${styles.accordionButton} ${
                                        activeIndex === index ? styles.active : ''
                                    }`}
                                    onClick={() => toggleAccordion(index)}
                                >
                                    <span className={styles.questionText}>{item.question}</span>
                                    <motion.span
                                        className={styles.accordionIcon}
                                        animate={{ rotate: activeIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        ▼
                                    </motion.span>
                                </button>
                                <AnimatePresence>
                                    {activeIndex === index && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={styles.accordionContent}
                                        >
                                            <div className={styles.answerText}>{item.answer}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.noResults}>
                        <p>Không tìm thấy câu hỏi phù hợp với từ khóa "{searchTerm}"</p>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <div className={styles.contactInfo}>
                    <h3>Vẫn còn thắc mắc?</h3>
                    <p>Liên hệ với chúng tôi để được hỗ trợ tốt nhất</p>
                    <div className={styles.contactMethods}>
                        <div className={styles.contactItem}>
                            <span className={styles.contactIcon}>📞</span>
                            <span>Hotline: 1900 1234</span>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.contactIcon}>✉️</span>
                            <span>Email: support@bookstore.com</span>
                        </div>
                        <div className={styles.contactItem}>
                            <span className={styles.contactIcon}>💬</span>
                            <span>Chat trực tuyến: 24/7</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
