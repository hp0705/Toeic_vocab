import fs from 'node:fs';
import path from 'node:path';

const vocabPath = path.resolve('data/vocab.json');
const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

// 1. Explicit fixed preposition & pattern data
const fixedPrepData = {
  // Preposition 'for'
  'responsible': { prep: ['for'], pattern: 'be responsible for + N/V-ing (chịu trách nhiệm về...)' },
  'be responsible for': { prep: ['for'], pattern: 'be responsible for + N/V-ing (chịu trách nhiệm về...)' },
  'take responsibility for': { prep: ['for'], pattern: 'take responsibility for + N/V-ing (nhận trách nhiệm về...)' },
  'eligible': { prep: ['for'], pattern: 'be eligible for + N / eligible to V (đủ điều kiện cho...)' },
  'be eligible for': { prep: ['for'], pattern: 'be eligible for + N / eligible to V (đủ điều kiện cho...)' },
  'apply for': { prep: ['for'], pattern: 'apply for + job/position/permit (nộp đơn xin việc/giấy phép...)' },
  'reimburse': { prep: ['for'], pattern: 'reimburse sb for sth (hoàn tiền lại cho ai khoản gì)' },
  'charge': { prep: ['for'], pattern: 'charge (sb) for sth (tính phí ai về việc gì)' },
  'substitute': { prep: ['for'], pattern: 'substitute for + N (thay thế cho...)' },
  'account for': { prep: ['for'], pattern: 'account for + % (chiếm tỷ lệ); account for sth (giải thích cho...)' },
  'allow for': { prep: ['for'], pattern: 'allow for + N (tính đến, dự trù...)' },
  'qualify for': { prep: ['for'], pattern: 'qualify for + N (đủ điều kiện/tiêu chuẩn cho...)' },
  'compensate': { prep: ['for'], pattern: 'compensate sb for sth (bồi thường cho ai vì...)' },
  'apologize': { prep: ['for', 'to'], pattern: 'apologize to sb for sth (xin lỗi ai về việc gì)' },
  'opt': { prep: ['for'], pattern: 'opt for + N (lựa chọn cái gì)' },
  'voucher': { prep: ['for'], pattern: 'voucher for + N (phiếu giảm giá/chứng từ cho...)' },
  'make up for': { prep: ['for'], pattern: 'make up for + N (đền bù, bù đắp cho...)' },
  'pay for': { prep: ['for'], pattern: 'pay for + items/services (thanh toán cho...)' },
  'search for': { prep: ['for'], pattern: 'search for + N (tìm kiếm...)' },
  'valid for': { prep: ['for'], pattern: 'valid for + time period (có hiệu lực trong bao lâu)' },
  'reputation for': { prep: ['for'], pattern: 'reputation for + N (danh tiếng về...)' },

  // Preposition 'to'
  'committed': { prep: ['to'], pattern: 'be committed to + N/V-ing (cam kết với...)' },
  'be committed to': { prep: ['to'], pattern: 'be committed to + N/V-ing (cam kết làm gì - to là giới từ)' },
  'dedicated': { prep: ['to'], pattern: 'be dedicated to + N/V-ing (tận tâm, cống hiến cho...)' },
  'be dedicated to': { prep: ['to'], pattern: 'be dedicated to + N/V-ing (tận tâm với...)' },
  'devoted': { prep: ['to'], pattern: 'be devoted to + N/V-ing (tận tụy với...)' },
  'look forward to': { prep: ['to'], pattern: 'look forward to + N/V-ing (trông đợi điều gì)' },
  'object to': { prep: ['to'], pattern: 'object to + N/V-ing (phản đối điều gì - to là giới từ)' },
  'subject': { prep: ['to'], pattern: 'be subject to + N (phải chịu, tuân theo, có thể thay đổi)' },
  'prior to': { prep: ['to'], pattern: 'prior to + N/V-ing (trước khi...)' },
  'apply to': { prep: ['to'], pattern: 'apply to + người/tổ chức (áp dụng cho ai; nộp đơn vào đâu)' },
  'subscribe': { prep: ['to'], pattern: 'subscribe to + a service/magazine (đăng ký theo dõi/mua định kỳ)' },
  'adhere': { prep: ['to'], pattern: 'adhere to + regulations/policies (tuân thủ nghiêm ngặt quy định)' },
  'conform': { prep: ['to'], pattern: 'conform to + standards/specifications (tuân theo chuẩn mực)' },
  'contribute': { prep: ['to'], pattern: 'contribute to + N/V-ing (đóng góp vào...)' },
  'lead to': { prep: ['to'], pattern: 'lead to + N (dẫn đến kết quả gì)' },
  'refer to': { prep: ['to'], pattern: 'refer to + N (tham khảo, ám chỉ...)' },
  'relate to': { prep: ['to'], pattern: 'relate to + N (liên quan đến...)' },
  'attribute': { prep: ['to'], pattern: 'attribute A to B (quy A là do B)' },
  'respond': { prep: ['to'], pattern: 'respond to + email/inquiry (phản hồi lại...)' },
  'reply': { prep: ['to'], pattern: 'reply to + N (trả lời thư/tin nhắn)' },
  'similar': { prep: ['to'], pattern: 'similar to + N (tương tự như...)' },
  'adjacent': { prep: ['to'], pattern: 'adjacent to + N (ngay cạnh, liền kề với...)' },
  'access': { prep: ['to', 'none'], pattern: 'have access to + N (danh từ đi với to) | access + N (động từ KHÔNG dùng to)' },
  'attach': { prep: ['to'], pattern: 'attach A to B (đính kèm A vào B)' },
  'in addition to': { prep: ['to'], pattern: 'in addition to + N/V-ing (bên cạnh, ngoài ra...)' },
  'entitled': { prep: ['to'], pattern: 'be entitled to + N (được quyền hưởng...)' },
  'due to': { prep: ['to'], pattern: 'due to + N/V-ing (bởi vì...)' },
  'owing to': { prep: ['to'], pattern: 'owing to + N (do, bởi vì...)' },
  'according to': { prep: ['to'], pattern: 'according to + N (theo như...)' },
  'allocate': { prep: ['to'], pattern: 'allocate A to B (phân bổ A cho B)' },
  'pay attention to': { prep: ['to'], pattern: 'pay attention to + N/V-ing (chú ý đến...)' },

  // Preposition 'with'
  'satisfied': { prep: ['with'], pattern: 'be satisfied with + N (hài lòng với...)' },
  'be satisfied with': { prep: ['with'], pattern: 'be satisfied with + N (hài lòng với...)' },
  'pleased': { prep: ['with'], pattern: 'be pleased with + N (vui lòng, hài lòng với...)' },
  'comply': { prep: ['with'], pattern: 'comply with + rules/regulations (tuân thủ luật lệ/quy định)' },
  'deal with': { prep: ['with'], pattern: 'deal with + client/problem (xử lý, giải quyết...)' },
  'familiar': { prep: ['with'], pattern: 'be familiar with + N (quen thuộc với...)' },
  'compatible': { prep: ['with'], pattern: 'be compatible with + N (tương thích với...)' },
  'consistent': { prep: ['with'], pattern: 'be consistent with + N (nhất quán, phù hợp với...)' },
  'coincide': { prep: ['with'], pattern: 'coincide with + N (trùng hợp với, xảy ra cùng lúc)' },
  'collaborate': { prep: ['with', 'on'], pattern: 'collaborate with sb on sth (hợp tác với ai về việc gì)' },
  'cooperate': { prep: ['with'], pattern: 'cooperate with + N (hợp tác với...)' },
  'associated': { prep: ['with'], pattern: 'be associated with + N (liên kết, gắn liền với...)' },
  'agree with': { prep: ['with'], pattern: 'agree with sb (đồng ý với ai)' },
  'agree on': { prep: ['on'], pattern: 'agree on a plan/price (thống nhất về kế hoạch/giá cả)' },
  'agree to': { prep: ['to'], pattern: 'agree to terms/conditions (chấp thuận các điều khoản)' },
  'compete': { prep: ['with', 'for'], pattern: 'compete with sb for sth (cạnh tranh với ai để giành cái gì)' },
  'merge': { prep: ['with'], pattern: 'merge with + company (sáp nhập với công ty khác)' },
  'replace': { prep: ['with'], pattern: 'replace A with B (thay thế A bằng B)' },
  'provide': { prep: ['with', 'to'], pattern: 'provide sb with sth | provide sth to sb (cung cấp)' },
  'equipped': { prep: ['with'], pattern: 'be equipped with + modern tools (được trang bị với...)' },
  'equip': { prep: ['with'], pattern: 'equip sth with sth (trang bị cái gì bằng cái gì)' },
  'in accordance with': { prep: ['with'], pattern: 'in accordance with + regulations (phù hợp theo quy định)' },
  'in compliance with': { prep: ['with'], pattern: 'in compliance with + standards (tuân thủ theo tiêu chuẩn)' },

  // Preposition 'on' / 'upon'
  'depend': { prep: ['on'], pattern: 'depend on + N (phụ thuộc vào...)' },
  'depend on': { prep: ['on'], pattern: 'depend on + N (phụ thuộc vào...)' },
  'rely': { prep: ['on'], pattern: 'rely on + N (dựa dẫm, tin tưởng vào...)' },
  'rely on': { prep: ['on'], pattern: 'rely on + N (tin cậy vào...)' },
  'focus': { prep: ['on'], pattern: 'focus on + N/V-ing (tập trung vào...)' },
  'focus on': { prep: ['on'], pattern: 'focus on + N/V-ing (tập trung vào...)' },
  'concentrate': { prep: ['on'], pattern: 'concentrate on + N/V-ing (tập trung cao độ vào...)' },
  'congratulate': { prep: ['on'], pattern: 'congratulate sb on sth (chúc mừng ai vì điều gì)' },
  'base': { prep: ['on'], pattern: 'base on / be based on + N (dựa trên cơ sở...)' },
  'comment': { prep: ['on'], pattern: 'comment on + N (bình luận, nhận xét về...)' },
  'spend': { prep: ['on'], pattern: 'spend money/time on + N/V-ing (chi tiêu vào...)' },
  'decide': { prep: ['on'], pattern: 'decide on + N (quyết định chọn cái gì)' },
  'insist': { prep: ['on'], pattern: 'insist on + N/V-ing (khăng khăng làm gì)' },
  'impose': { prep: ['on'], pattern: 'impose tax/fine on sb/sth (áp đặt thuế/phạt lên...)' },
  'impact': { prep: ['on'], pattern: 'impact on + N | have an impact on (tác động lên...)' },
  'discount': { prep: ['on'], pattern: 'discount on + items (giảm giá cho mặt hàng nào)' },
  'expire': { prep: ['on'], pattern: 'expire on + date (hết hạn vào ngày cụ thể)' },
  'upon receipt': { prep: ['of'], pattern: 'upon receipt of + N (ngay khi nhận được...)' },

  // Preposition 'in'
  'participate': { prep: ['in'], pattern: 'participate in + event/survey (tham gia vào...)' },
  'participate in': { prep: ['in'], pattern: 'participate in + event/meeting (tham gia vào...)' },
  'specialize': { prep: ['in'], pattern: 'specialize in + field/products (chuyên về lĩnh vực/sản phẩm gì)' },
  'succeed': { prep: ['in'], pattern: 'succeed in + V-ing (thành công trong việc làm gì)' },
  'succeed in': { prep: ['in'], pattern: 'succeed in + V-ing (thành công trong việc làm gì)' },
  'invest': { prep: ['in'], pattern: 'invest in + market/stocks (đầu tư vào...)' },
  'engage': { prep: ['in'], pattern: 'engage in + activities (tham gia vào hoạt động)' },
  'enroll': { prep: ['in'], pattern: 'enroll in + a course/program (ghi danh vào khóa học)' },
  'result in': { prep: ['in'], pattern: 'result in + N (dẫn đến kết quả gì)' },
  'involved': { prep: ['in'], pattern: 'be involved in + N/V-ing (tham gia, liên quan tới...)' },
  'interested': { prep: ['in'], pattern: 'be interested in + N/V-ing (quan tâm, thích thú...)' },
  'be interested in': { prep: ['in'], pattern: 'be interested in + N/V-ing (quan tâm đến...)' },
  'take part in': { prep: ['in'], pattern: 'take part in + event (tham gia vào...)' },
  'in advance': { prep: ['in'], pattern: 'in advance (trước: pay in advance, book in advance)' },
  'in bulk': { prep: ['in'], pattern: 'in bulk (mua sỉ số lượng lớn)' },
  'in progress': { prep: ['in'], pattern: 'in progress (đang trong quá trình thực hiện)' },
  'in stock': { prep: ['in'], pattern: 'in stock (còn hàng trong kho)' },

  // Preposition 'from'
  'benefit': { prep: ['from'], pattern: 'benefit from + N (hưởng lợi từ...)' },
  'benefit from': { prep: ['from'], pattern: 'benefit from + N (hưởng lợi từ...)' },
  'differ': { prep: ['from'], pattern: 'differ from + N (khác biệt so với...)' },
  'differ from': { prep: ['from'], pattern: 'differ from + N (khác với...)' },
  'result from': { prep: ['from'], pattern: 'result from + N (bắt nguồn từ, do nguyên nhân gì)' },
  'prevent': { prep: ['from'], pattern: 'prevent sb from + V-ing (ngăn chặn ai làm gì)' },
  'prohibit': { prep: ['from'], pattern: 'prohibit sb from + V-ing (cấm ai làm gì)' },
  'refrain': { prep: ['from'], pattern: 'refrain from + V-ing (kiềm chế, tránh làm gì)' },
  'protect': { prep: ['from'], pattern: 'protect A from B (bảo vệ A khỏi B)' },
  'suffer': { prep: ['from'], pattern: 'suffer from + loss/delays (chịu đựng, bị ảnh hưởng)' },
  'separate': { prep: ['from'], pattern: 'separate A from B (tách rời A khỏi B)' },
  'aside from': { prep: ['from'], pattern: 'aside from + N (ngoài ra, trừ ra...)' },
  'apart from': { prep: ['from'], pattern: 'apart from + N (ngoài ra, trừ...)' },

  // Preposition 'of'
  'consist': { prep: ['of'], pattern: 'consist of + N (bao gồm - không dùng thể bị động)' },
  'consist of': { prep: ['of'], pattern: 'consist of + N (gồm có...)' },
  'capable': { prep: ['of'], pattern: 'be capable of + V-ing (có năng lực/khả năng làm gì)' },
  'be capable of': { prep: ['of'], pattern: 'be capable of + V-ing (có khả năng làm gì)' },
  'aware': { prep: ['of'], pattern: 'be aware of + N/that (nhận thức được, biết về...)' },
  'be aware of': { prep: ['of'], pattern: 'be aware of + N (nhận thức được...)' },
  'conscious': { prep: ['of'], pattern: 'be conscious of + N (ý thức về...)' },
  'take advantage of': { prep: ['of'], pattern: 'take advantage of + N (tận dụng, khai thác...)' },
  'take care of': { prep: ['of'], pattern: 'take care of + N (chăm sóc, lo liệu, xử lý)' },
  'out of stock': { prep: ['of'], pattern: 'out of stock (hết hàng)' },
  'in charge of': { prep: ['of'], pattern: 'in charge of + N/V-ing (phụ trách...)' },
  'regardless of': { prep: ['of'], pattern: 'regardless of + N (bất kể, không màng tới...)' },
  'instead of': { prep: ['of'], pattern: 'instead of + N/V-ing (thay vì...)' },
  'dispose of': { prep: ['of'], pattern: 'dispose of + waste/items (vứt bỏ, xử lý rác)' },

  // Preposition 'about'
  'inquire': { prep: ['about'], pattern: 'inquire about + prices/services (hỏi thông tin về...)' },
  'concerned': { prep: ['about'], pattern: 'concerned about + N (lo lắng, bận tâm về...)' },
  'enthusiastic': { prep: ['about'], pattern: 'enthusiastic about + N (hào hứng, nhiệt huyết về...)' },
  'optimistic': { prep: ['about'], pattern: 'optimistic about + future/sales (lạc quan về...)' },

  // Preposition 'into'
  'divide': { prep: ['into'], pattern: 'divide into + groups/parts (chia thành các phần)' },
  'translate': { prep: ['into'], pattern: 'translate into + language (dịch sang ngôn ngữ)' },
  'look into': { prep: ['into'], pattern: 'look into + matter/issue (điều tra, xem xét kỹ)' },
  'take into account': { prep: ['into'], pattern: 'take sth into account (tính đến, xem xét)' },

  // TRANSITIVE VERBS - NO PREPOSITION (TOEIC TRAPS)
  'approve': { prep: ['none'], pattern: 'approve + N (approve proposal) - Ngoại động từ: KHÔNG dùng "approve of" trong TOEIC' },
  'reach': { prep: ['none'], pattern: 'reach + N (reach an agreement / reach destination) - KHÔNG dùng "reach to"' },
  'mention': { prep: ['none'], pattern: 'mention + N (mention the problem) - KHÔNG dùng "mention about"' },
  'discuss': { prep: ['none'], pattern: 'discuss + N (discuss the plan) - KHÔNG dùng "discuss about"' },
  'contact': { prep: ['none'], pattern: 'contact + N (contact customer service) - KHÔNG dùng "contact with/to"' },
  'accommodate': { prep: ['none'], pattern: 'accommodate + N (accommodate 300 guests) - KHÔNG dùng "accommodate for"' },
  'comprise': { prep: ['none'], pattern: 'comprise + N (comprise 10 members) - KHÔNG dùng "comprise of"' },
  'attend': { prep: ['none'], pattern: 'attend + N (attend a meeting/seminar) - KHÔNG dùng "attend to/at"' },
  'inspect': { prep: ['none'], pattern: 'inspect + N (inspect the facility) - KHÔNG dùng "inspect into"' },
  'face': { prep: ['none'], pattern: 'face + N (face challenges) - KHÔNG dùng "face with" ở dạng chủ động' }
};

// 2. Headword specific POS override dictionary
const specificPosMap = {
  // Dual-class words & common nouns/verbs/adj
  'shipment': ['n'], 'package': ['n', 'v'], 'warehouse': ['n'], 'inventory': ['n'],
  'dispatch': ['v', 'n'], 'courier': ['n'], 'supplier': ['n'], 'vendor': ['n'],
  'purchase order': ['n'], 'distribution': ['n'], 'transportation': ['n'], 'freight': ['n'],
  'carrier': ['n'], 'load': ['v', 'n'], 'unload': ['v'], 'route': ['n'], 'storage': ['n'],
  'customs': ['n'], 'export': ['v', 'n'], 'import': ['v', 'n'], 'logistics': ['n'],
  'handling fee': ['n'], 'return policy': ['n'], 'stock': ['n', 'v'],
  'out of stock': ['adj', 'phrase'], 'in stock': ['adj', 'phrase'], 'order': ['n', 'v'],
  'purchase': ['v', 'n'], 'receipt': ['n'], 'packaging': ['n'],
  'reservation': ['n'], 'check-in': ['n', 'v'], 'check-out': ['n', 'v'], 'available': ['adj'],
  'amenities': ['n'], 'itinerary': ['n'], 'departure': ['n'], 'arrival': ['n'],
  'boarding pass': ['n'], 'luggage': ['n'], 'carry-on': ['n', 'adj'], 'destination': ['n'],
  'fare': ['n'], 'accommodation': ['n'], 'confirm': ['v'], 'upgrade': ['v', 'n'],
  'complimentary': ['adj'], 'housekeeping': ['n'], 'brochure': ['n'], 'promotion': ['n'],
  'shuttle': ['n', 'v'], 'delay': ['v', 'n'], 'cancellation': ['n'], 'concierge': ['n'],
  'vacancy': ['n'], 'fully booked': ['adj', 'phrase'], 'valid': ['adj'],
  'department': ['n'], 'supervisor': ['n'], 'colleague': ['n'], 'deadline': ['n'],
  'approve': ['v'], 'approval': ['n'], 'reject': ['v'], 'overtime': ['n', 'adv'],
  'shift': ['n', 'v'], 'attendance': ['n'], 'resignation': ['n'], 'resign': ['v'],
  'retire': ['v'], 'retirement': ['n'], 'performance review': ['n'], 'evaluation': ['n'],
  'evaluate': ['v'], 'personnel': ['n'], 'staff': ['n'], 'meeting': ['n'],
  'agenda': ['n'], 'minutes': ['n'], 'conference': ['n'], 'presentation': ['n'],
  'present': ['v', 'adj'], 'schedule': ['n', 'v'], 'reschedule': ['v'], 'postpone': ['v'],
  'cancel': ['v'], 'notice': ['n', 'v'], 'memo': ['n'], 'policy': ['n'],
  'procedure': ['n'], 'guideline': ['n'], 'protocol': ['n'],
  'install': ['v'], 'backup': ['n', 'v'], 'security': ['n'], 'access': ['n', 'v'],
  'server': ['n'], 'database': ['n'], 'software': ['n'], 'hardware': ['n'],
  'network': ['n'], 'troubleshoot': ['v'], 'update': ['v', 'n'], 'upgrade': ['v', 'n'],
  'system': ['n'], 'device': ['n'], 'technical support': ['n'],
  'budget': ['n', 'v'], 'expense': ['n'], 'revenue': ['n'], 'invoice': ['n', 'v'],
  'contract': ['n', 'v'], 'profit': ['n', 'v'], 'loss': ['n'], 'audit': ['n', 'v'],
  'investment': ['n'], 'invest': ['v'], 'investor': ['n'], 'fund': ['n', 'v'],
  'loan': ['n', 'v'], 'interest rate': ['n'], 'statement': ['n'], 'balance': ['n', 'v'],
  'transaction': ['n'], 'currency': ['n'], 'exchange rate': ['n'], 'fiscal year': ['n'],
  'quarter': ['n'], 'dividend': ['n'], 'shareholder': ['n'], 'stockholder': ['n'],
  'asset': ['n'], 'liability': ['n'], 'overhead': ['n', 'adj'], 'deficit': ['n'],
  'surplus': ['n', 'adj'], 'billing': ['n'], 'reimbursement': ['n'], 'reimburse': ['v'],
  'expenditure': ['n'], 'payroll': ['n'], 'compensation': ['n'], 'remuneration': ['n'],
  'advertisement': ['n'], 'launch': ['v', 'n'], 'market research': ['n'],
  'target audience': ['n'], 'campaign': ['n', 'v'], 'brand': ['n', 'v'],
  'client': ['n'], 'customer': ['n'], 'consumer': ['n'], 'competitor': ['n'],
  'competition': ['n'], 'survey': ['n', 'v'], 'feedback': ['n'], 'questionnaire': ['n'],
  'commercial': ['n', 'adj'], 'flyer': ['n'], 'press release': ['n'], 'publicity': ['n'],
  'endorsement': ['n'], 'sponsor': ['n', 'v'], 'sponsorship': ['n'],
  'appetizer': ['n'], 'entrée': ['n'], 'dessert': ['n'], 'beverage': ['n'],
  'buffet': ['n'], 'catering': ['n'], 'ingredient': ['n'],
  'lease': ['n', 'v'], 'tenant': ['n'], 'landlord': ['n'], 'property': ['n'],
  'mortgage': ['n', 'v'], 'utilities': ['n'], 'renovation': ['n'], 'maintenance': ['n'],
  'premises': ['n'],
  'exhibit': ['n', 'v'], 'exhibition': ['n'], 'admission': ['n'], 'performance': ['n'],
  'audience': ['n'], 'spectator': ['n'], 'venue': ['n'],
  'physician': ['n'], 'prescription': ['n'], 'symptom': ['n'], 'treatment': ['n'],
  'checkup': ['n'],
  'manufacture': ['v', 'n'], 'assembly line': ['n'], 'quality control': ['n'],
  'defect': ['n'], 'raw materials': ['n'], 'machinery': ['n'], 'breakdown': ['n'],
  'downtime': ['n'], 'capacity': ['n'], 'output': ['n'], 'yield': ['n', 'v'],
  'human resources': ['n'], 'recruit': ['v', 'n'], 'candidate': ['n'], 'applicant': ['n'],
  'interviewee': ['n'], 'interviewer': ['n'], 'job opening': ['n'],
  'probationary period': ['n'], 'seminar': ['n'], 'workshop': ['n'], 'keynote speaker': ['n'],
  'panel discussion': ['n'], 'retailer': ['n'], 'wholesaler': ['n'], 'merchandise': ['n'],
  'repair shop': ['n'], 'technician': ['n'], 'transit': ['n', 'v'], 'commute': ['v', 'n'],
  'congestion': ['n'],
  'affect': ['v'], 'effect': ['n'], 'fare': ['n'], 'fair': ['adj', 'n'],
  'principal': ['adj', 'n'], 'principle': ['n'], 'compliment': ['n', 'v'], 'complement': ['v', 'n'],
  'stationary': ['adj'], 'stationery': ['n'], 'council': ['n'], 'counsel': ['n', 'v'],
  'lose': ['v'], 'loose': ['adj'], 'advice': ['n'], 'advise': ['v'],
  'breath': ['n'], 'breathe': ['v'], 'cloth': ['n'], 'clothe': ['v'],
  'device': ['n'], 'devise': ['v'], 'practice': ['n'], 'practise': ['v'],
  'precede': ['v'], 'proceed': ['v'], 'ensure': ['v'], 'insure': ['v'], 'assure': ['v'],
  'postpone': ['v'], 'delay': ['v', 'n'], 'put off': ['v', 'phrasal_v'],
  'cancel': ['v'], 'call off': ['v', 'phrasal_v'],
  'require': ['v'], 'request': ['v', 'n'], 'demand': ['v', 'n'],
  'resolve': ['v'], 'solve': ['v'], 'address': ['v', 'n'],
  'participate in': ['v', 'collocation'], 'take part in': ['v', 'collocation'], 'join': ['v'],
  'establish': ['v'], 'set up': ['v', 'phrasal_v'], 'found': ['v'],
  'obtain': ['v'], 'acquire': ['v'], 'gain': ['v', 'n'],
  'examine': ['v'], 'inspect': ['v'], 'check': ['v', 'n'],
  'provide': ['v'], 'supply': ['v', 'n'], 'furnish': ['v'],
  'reduce': ['v'], 'decrease': ['v', 'n'], 'cut down on': ['v', 'phrasal_v'],
  'increase': ['v', 'n'], 'rise': ['v', 'n'], 'go up': ['v', 'phrasal_v'],
  'cover': ['v'], 'issue': ['n', 'v'], 'post': ['n', 'v'],
  'present': ['v', 'adj', 'n'], 'record': ['n', 'v'], 'subject': ['n', 'adj', 'v'],
  'contract': ['n', 'v'], 'object': ['n', 'v'], 'produce': ['v', 'n'],
  'conduct': ['v', 'n'], 'lead': ['v', 'n'], 'minute': ['n'],
  'content': ['n', 'adj'], 'fine': ['adj', 'n', 'v'], 'bill': ['n', 'v'],
  'charge': ['v', 'n'], 'rate': ['n', 'v'], 'term': ['n'],
  'interest': ['n', 'v'], 'facility': ['n'], 'balance': ['n', 'v'],
  'note': ['n', 'v'], 'notice': ['n', 'v'], 'party': ['n'],
  'review': ['n', 'v'], 'secure': ['adj', 'v'],
  'expiration': ['n'], 'inquiry': ['n'], 'criteria': ['n'], 'regulation': ['n'],
  'specifications': ['n'], 'initiative': ['n'], 'perspective': ['n'], 'incentive': ['n'],
  'objective': ['n', 'adj'], 'representative': ['n', 'adj'], 'alternative': ['n', 'adj'],
  'delegation': ['n'], 'delegate': ['n', 'v'], 'subsidiary': ['n', 'adj'],
  'headquarters': ['n'], 'branch': ['n'], 'merger': ['n'], 'acquisition': ['n'],
  'monopoly': ['n'], 'liability': ['n'], 'clause': ['n'], 'provision': ['n'],
  'stipulation': ['n'], 'warranty': ['n'], 'guarantee': ['n', 'v'],
  'accessible': ['adj'], 'applicable': ['adj'], 'comparable': ['adj'], 'adequate': ['adj'],
  'accurate': ['adj'], 'substantial': ['adj'], 'temporary': ['adj'], 'permanent': ['adj'],
  'confidential': ['adj'], 'preliminary': ['adj'], 'tentative': ['adj'], 'prospective': ['adj'],
  'deliberate': ['adj', 'v'], 'accurately': ['adv'], 'substantially': ['adv'],
  'adequately': ['adv'], 'temporarily': ['adv'], 'permanently': ['adv'],
  'confidentially': ['adv'], 'preliminarily': ['adv'], 'tentatively': ['adv'],
  'deliberately': ['adv'], 'consistently': ['adv'], 'exclusively': ['adv'],
  'mutually': ['adv'], 'unanimously': ['adv'],
  'accept': ['v'], 'accompany': ['v'], 'accomplish': ['v'], 'account': ['v', 'n'],
  'achieve': ['v'], 'act': ['v', 'n'], 'adapt': ['v'], 'administer': ['v'],
  'advertise': ['v'], 'advise': ['v'], 'agree': ['v'], 'allow': ['v'],
  'analyze': ['v'], 'announce': ['v'], 'apply': ['v'], 'appoint': ['v'],
  'appreciate': ['v'], 'approve': ['v'], 'arrange': ['v'], 'assist': ['v'],
  'associate': ['v'], 'assume': ['v'], 'assure': ['v'], 'attach': ['v'],
  'attend': ['v'], 'attract': ['v'], 'authorize': ['v'], 'broaden': ['v'],
  'calculate': ['v'], 'cancel': ['v'], 'certify': ['v'], 'collaborate': ['v'],
  'collect': ['v'], 'combine': ['v'], 'communicate': ['v'], 'compare': ['v'],
  'compensate': ['v'], 'compete': ['v'], 'complain': ['v'], 'complete': ['v', 'adj'],
  'comply': ['v'], 'conclude': ['v'], 'conduct': ['v', 'n'], 'confirm': ['v'],
  'connect': ['v'], 'consider': ['v'], 'construct': ['v'], 'consult': ['v'],
  'consume': ['v'], 'contact': ['v', 'n'], 'contain': ['v'], 'continue': ['v'],
  'contribute': ['v'], 'convenience': ['n'], 'convert': ['v'], 'convince': ['v'],
  'cooperate': ['v'], 'coordinate': ['v'], 'create': ['v'], 'criticize': ['v'],
  'decide': ['v'], 'declare': ['v'], 'decorate': ['v'], 'dedicate': ['v'],
  'define': ['v'], 'deliver': ['v'], 'demonstrate': ['v'], 'depend': ['v'],
  'describe': ['v'], 'design': ['v', 'n'], 'detail': ['n', 'v'], 'develop': ['v'],
  'direct': ['v', 'adj'], 'disagree': ['v'], 'distribute': ['v'], 'divide': ['v'],
  'donate': ['v'], 'economy': ['n'], 'educate': ['v'], 'efficient': ['adj'],
  'elect': ['v'], 'employ': ['v'], 'encourage': ['v'], 'engage': ['v'],
  'engineer': ['n', 'v'], 'entertain': ['v'], 'enthusiastic': ['adj'], 'equip': ['v'],
  'establish': ['v'], 'estimate': ['v', 'n'], 'evaluate': ['v'], 'examine': ['v'],
  'exceed': ['v'], 'expand': ['v'], 'expect': ['v'], 'explain': ['v']
};

let enrichedPosCount = 0;
let enrichedFixedPrepCount = 0;

const updatedVocab = vocab.map((entry) => {
  const head = entry.headword.trim().toLowerCase();
  let pos = entry.pos ? [...entry.pos] : [];
  let fixedPrep = entry.fixedPrep ? [...entry.fixedPrep] : [];
  let patterns = entry.patterns ? [...entry.patterns] : [];

  // 1. Derive POS based on section or dictionary
  if (pos.length === 0) {
    if (specificPosMap[head]) {
      pos = [...specificPosMap[head]];
    } else if (entry.sectionNo === 11) {
      pos = ['collocation'];
    } else if (entry.sectionNo === 12 || entry.sectionNo === 24) {
      pos = ['v'];
    } else if (entry.sectionNo === 13) {
      pos = ['adj'];
    } else if (entry.sectionNo === 14) {
      pos = ['adv'];
    } else if (entry.sectionNo === 15) {
      pos = ['prep'];
    } else if (entry.sectionNo === 16) {
      pos = ['phrasal_v'];
    } else if (entry.sectionNo === 17 || entry.sectionNo === 27) {
      pos = ['phrase'];
    } else if (entry.sectionNo === 22) {
      pos = ['conj'];
    } else if (entry.sectionNo === 23) {
      if (head.startsWith('be ') || head.includes('responsible') || head.includes('eligible') || head.includes('capable') || head.includes('aware') || head.includes('interested') || head.includes('satisfied') || head.includes('dedicated') || head.includes('committed')) {
        pos = ['adj'];
      } else if (entry.id.includes('by-vs-until') || entry.id.includes('between') || entry.id.includes('beside') || entry.id.includes('since') || entry.id.includes('for-during') || entry.id.includes('pending') || entry.id.includes('following') || entry.id.includes('unlike') || entry.id.includes('per') || entry.id.includes('via') || entry.id.includes('given')) {
        pos = ['prep'];
      } else {
        pos = ['v'];
      }
    } else if (entry.sectionNo === 25) {
      if (entry.headword.endsWith('ly') && !['friendly', 'costly', 'timely', 'orderly'].includes(head)) {
        pos = ['adv'];
      } else {
        pos = ['adj'];
      }
    } else if (entry.sectionNo === 26) {
      pos = ['n'];
    } else if (entry.sectionNo === 28) {
      pos = ['quantifier'];
    } else if (entry.sectionNo === 104) {
      pos = ['v'];
    } else if (entry.sectionNo >= 101 && entry.sectionNo <= 103) {
      // Word family root
      if (head.endsWith('tion') || head.endsWith('ity') || head.endsWith('ment') || head.endsWith('ence') || head.endsWith('ance')) {
        pos = ['n'];
      } else if (head.endsWith('able') || head.endsWith('ive') || head.endsWith('ent') || head.endsWith('ant') || head.endsWith('al')) {
        pos = ['adj'];
      } else {
        pos = ['v'];
      }
    } else {
      // Heuristic fallback for Sections 1-10, 18-21
      const m = entry.meaningVi.toLowerCase();
      if (m.startsWith('sự ') || m.startsWith('người ') || m.startsWith('nhà ') || m.startsWith('lô ') || m.startsWith('kiện ') || m.startsWith('đơn ') || m.startsWith('hàng ') || m.startsWith('kho ') || m.startsWith('hãng ') || m.startsWith('phí ') || m.startsWith('chính sách ') || m.startsWith('biên lai ') || m.startsWith('bao bì ') || m.startsWith('phòng ') || m.startsWith('ban ') || m.startsWith('giám sát ') || m.startsWith('hạn ') || m.startsWith('ngân sách ') || m.startsWith('chi phí ') || m.startsWith('doanh thu ') || m.startsWith('hóa đơn ') || m.startsWith('hợp đồng ') || m.startsWith('quảng cáo ') || m.startsWith('chiến dịch ') || m.startsWith('món ') || m.startsWith('tiền ') || m.startsWith('tài sản ') || m.startsWith('triển lãm ') || m.startsWith('triệu chứng ') || m.startsWith('hành lý ') || m.startsWith('vé ') || m.startsWith('giá vé ') || m.startsWith('chỗ ở ')) {
        pos = ['n'];
      } else if (m.startsWith('làm ') || m.startsWith('gửi ') || m.startsWith('chất ') || m.startsWith('dỡ ') || m.startsWith('xuất ') || m.startsWith('nhập ') || m.startsWith('đặt ') || m.startsWith('mua ') || m.startsWith('duyệt ') || m.startsWith('cài ') || m.startsWith('sao lưu ') || m.startsWith('khởi chạy ') || m.startsWith('sản xuất ') || m.startsWith('trì hoãn ') || m.startsWith('hủy ') || m.startsWith('thông báo ') || m.startsWith('giải quyết ') || m.startsWith('trình bày ') || m.startsWith('xác nhận ') || m.startsWith('nâng cấp ') || m.startsWith('chuyển ') || m.startsWith('cung cấp ') || m.startsWith('yêu cầu ') || m.startsWith('đề xuất ') || m.startsWith('tham gia ') || m.startsWith('phân tích ') || m.startsWith('hoàn thành ') || m.startsWith('cạnh tranh ') || m.startsWith('tuân thủ ') || m.startsWith('mô tả ') || m.startsWith('khuyến khích ') || m.startsWith('giải thích ')) {
        pos = ['v'];
      } else if (m.startsWith('có sẵn') || m.startsWith('còn trống') || m.startsWith('miễn phí') || m.startsWith('thuận tiện') || m.startsWith('đầy đủ') || m.startsWith('bắt buộc') || m.startsWith('hợp lệ') || m.startsWith('hiệu quả') || m.startsWith('chính xác') || m.startsWith('nghiêm ngặt') || m.startsWith('linh hoạt') || m.startsWith('phù hợp') || m.startsWith('tương thích') || m.startsWith('tương tự')) {
        pos = ['adj'];
      } else {
        // Default to noun
        pos = ['n'];
      }
    }
  }

  // 2. Check fixed preposition rules
  let matchedRule = fixedPrepData[head];
  if (!matchedRule) {
    // Check if headword contains or matches known phrases
    for (const [key, val] of Object.entries(fixedPrepData)) {
      if (head === key || head.startsWith(key + ' ') || head.endsWith(' ' + key)) {
        matchedRule = val;
        break;
      }
    }
  }

  // Also check if patterns has preposition patterns
  if (matchedRule) {
    fixedPrep = [...matchedRule.prep];
    if (matchedRule.pattern && !patterns.includes(matchedRule.pattern)) {
      patterns.unshift(matchedRule.pattern);
    }
  } else {
    // Check if existing patterns or meaning has clear preposition structures
    const allText = (patterns.join(' ') + ' ' + (entry.meaningVi || '')).toLowerCase();
    const foundPreps = [];
    if (/\b(responsible for|eligible for|apply for|reimburse.*for|charge.*for|substitute for|account for|compensate.*for)\b/i.test(allText)) foundPreps.push('for');
    if (/\b(committed to|dedicated to|devoted to|look forward to|object to|subject to|prior to|subscribe to|adhere to|conform to|contribute to|lead to|refer to|relate to|similar to|adjacent to|access to)\b/i.test(allText)) foundPreps.push('to');
    if (/\b(satisfied with|pleased with|comply with|deal with|familiar with|compatible with|consistent with|collaborate with|cooperate with|equipped with)\b/i.test(allText)) foundPreps.push('with');
    if (/\b(depend on|rely on|focus on|concentrate on|base on|comment on|spend.*on|insist on|expire on)\b/i.test(allText)) foundPreps.push('on');
    if (/\b(participate in|specialize in|succeed in|invest in|engage in|enroll in|result in|interested in|take part in)\b/i.test(allText)) foundPreps.push('in');
    if (/\b(benefit from|differ from|result from|prevent.*from|prohibit.*from|refrain from|protect.*from)\b/i.test(allText)) foundPreps.push('from');
    if (/\b(consist of|capable of|aware of|take advantage of|take care of|out of)\b/i.test(allText)) foundPreps.push('of');
    if (/\b(inquire about|concerned about|enthusiastic about|optimistic about)\b/i.test(allText)) foundPreps.push('about');
    if (/\b(divide into|translate into|look into)\b/i.test(allText)) foundPreps.push('into');

    if (foundPreps.length > 0) {
      fixedPrep = Array.from(new Set([...fixedPrep, ...foundPreps]));
    }
  }

  if (pos.length > 0) enrichedPosCount++;
  if (fixedPrep.length > 0) enrichedFixedPrepCount++;

  return {
    ...entry,
    pos: pos.length > 0 ? pos : undefined,
    fixedPrep: fixedPrep.length > 0 ? fixedPrep : undefined,
    patterns: patterns.length > 0 ? patterns : undefined
  };
});

fs.writeFileSync(vocabPath, JSON.stringify(updatedVocab, null, 2), 'utf8');

console.log(`Enrichment complete!`);
console.log(`Total entries: ${updatedVocab.length}`);
console.log(`Entries with POS: ${enrichedPosCount} (100% = ${updatedVocab.length})`);
console.log(`Entries with fixedPrep: ${enrichedFixedPrepCount}`);
