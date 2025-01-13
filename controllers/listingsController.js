const BaseController = require("./baseController");

class ListingsController extends BaseController {
  constructor(model, userModel) {
    super(model);
    this.userModel = userModel;
  }

  /**
   * Create listing. Requires authentication.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async insertOne(req, res) {
    const { title, category, condition, price, description, shippingDetails } =
      req.body;
    try {
      // Retrieve seller from DB via seller email from auth
      const [seller] = await this.userModel.findOrCreate({
        where: {
          email: req.body.sellerEmail,
        },
      });

      // Create new listing
      const newListing = await this.model.create({
        title: title,
        category: category,
        condition: condition,
        price: price,
        description: description,
        shippingDetails: shippingDetails,
        buyerId: null,
        sellerId: seller.id,
      });

      // Respond with new listing
      return res.json(newListing);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: true, msg: err });
    }
  }

  /**
   * Retrieve specific listing. No authentication required.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async getOne(req, res) {
    const { listingId } = req.params;
    try {
      const listing = await this.model.findByPk(listingId);
      return res.json(listing);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  /**
   * Buy specific listing. Requires authentication.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async buyItem(req, res) {
    const { listingId } = req.params;
    try {
      const listing = await this.model.findByPk(listingId);

      // Retrieve seller from DB via seller email from auth
      const [buyer] = await this.userModel.findOrCreate({
        where: {
          email: req.body.buyerEmail,
        },
      });

      await listing.update({ buyerId: buyer.id });

      // Respond to acknowledge update
      return res.json(listing);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }
}

module.exports = ListingsController;
