import * as paymentService from './payment.service.js';

export const initiatePayment = async (req, res) => {
  try {
    const { saleId } = req.body;
    if (!saleId) return res.status(400).json({ success: false, message: 'saleId is required' });

    const organisationId = req.user.organisationId;
    if (!organisationId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const payment = await paymentService.initiatePayment(saleId, organisationId);
    res.status(201).json({ success: true, message: 'Payment initiated', data: payment });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { saleId, paymentId } = req.body;
    if (!saleId || !paymentId) {
      return res.status(400).json({ success: false, message: 'saleId and paymentId are required' });
    }

    const organisationId = req.user.organisationId;
    if (!organisationId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const result = await paymentService.verifyPayment(saleId, paymentId, organisationId);
    res.status(200).json({
      success: true,
      message: result.alreadyCompleted ? 'Payment was already verified' : 'Payment verified — ownership transferred',
      data: result.payment
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

// No auth middleware on this route — it is called by the payment gateway
export const handleWebhook = async (req, res) => {
  try {
    const result = await paymentService.handleWebhook(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    // Return 200 to gateway even on our errors to prevent retries for permanent failures
    // Log the error for internal investigation
    console.error('[Webhook] Error:', error.message, req.body);
    res.status(200).json({ success: false, message: error.message });
  }
};

export const getPaymentBySaleId = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const payment = await paymentService.getPaymentBySaleId(req.params.saleId, organisationId);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'No payment record found for this sale' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const organisationId = req.user.organisationId;
    const role = req.user.role;
    const result = await paymentService.refundPayment(req.params.paymentId, organisationId, role);
    res.status(200).json({ success: true, message: 'Refund processed', data: result });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  }
};
