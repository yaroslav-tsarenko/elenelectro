import { PolicyLayout, ContactBlock } from "@/components/layout/PolicyLayout/PolicyLayout";

export const metadata = { title: "Shipping Policy — AvontShop" };

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Shipping Policy" lastUpdated="29 May 2026">
      <p>
        This Shipping Policy explains how orders placed through www.avontshop.com are processed,
        dispatched, delivered, and handled in the event of delivery issues.
      </p>
      <p>The Website is operated by:</p>
      <ContactBlock />
      <p>
        In this Policy, &ldquo;AvontShop&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;
        means AVONTRA LTD. &ldquo;Customer&rdquo;, &ldquo;you&rdquo; or &ldquo;your&rdquo; means the
        person or business placing an order through the Website.
      </p>
      <p>
        This Shipping Policy should be read together with our Terms and Conditions, Returns and Refunds
        Policy, Privacy Policy, and any additional information displayed at checkout.
      </p>

      <h2>1. Scope of This Policy</h2>
      <p>1.1 This Policy applies to the delivery of physical goods purchased through AvontShop.</p>
      <p>
        1.2 AvontShop supplies electrical products, electrical materials, wiring accessories,
        lighting-related products, installation components, distribution and circuit protection products,
        sockets, switches, cables, mounting accessories, and other related goods.
      </p>
      <p>
        1.3 Delivery options, shipping rates, estimated delivery times, and supported destinations may vary
        depending on the destination country, product type, order value, product size, weight, courier
        availability, customs requirements, and other operational factors.
      </p>
      <p>
        1.4 Delivery estimates are not guaranteed delivery dates unless expressly stated otherwise in writing
        by AvontShop.
      </p>

      <h2>2. Order Processing Time</h2>
      <p>
        2.1 Orders are typically processed within 1&ndash;2 business days after successful payment
        confirmation.
      </p>
      <p>
        2.2 Processing time means the time required to review the order, confirm payment, prepare the goods,
        complete fulfilment checks, and hand the parcel to the carrier.
      </p>
      <p>
        2.3 Processing times may be longer during peak seasons, promotional periods, public holidays,
        high-volume periods, supplier delays, stock checks, payment reviews, fraud prevention reviews, or
        where additional order verification is required.
      </p>
      <p>
        2.4 Orders containing multiple products may be dispatched together or in separate parcels depending
        on stock availability, product type, packaging requirements, and logistics efficiency.
      </p>
      <p>
        2.5 If an item is unavailable, delayed, discontinued, incorrectly listed, or cannot be supplied, we
        may contact you to offer an alternative, delay the order, partially fulfil the order, or cancel and
        refund the unavailable item.
      </p>

      <h2>3. Dispatch Location</h2>
      <p>3.1 AvontShop dispatches orders from the United Kingdom.</p>
      <p>
        3.2 Delivery times shown in this Policy are calculated from the date of dispatch, not from the date
        the order is placed.
      </p>
      <p>
        3.3 Once your order has been dispatched, you may receive a shipping confirmation email or tracking
        information where available.
      </p>
      <p>
        3.4 Tracking availability depends on the courier, destination, delivery method, and service used.
      </p>

      <h2>4. Delivery Methods and Carriers</h2>
      <p>4.1 We use trusted courier and postal partners to deliver orders.</p>
      <p>
        4.2 Domestic UK orders may be delivered by Royal Mail, DHL, or another suitable domestic carrier
        depending on the parcel size, destination, product type, and operational requirements.
      </p>
      <p>
        4.3 International orders are generally delivered using DHL international services, partner carriers,
        local couriers, or other logistics providers suitable for the destination.
      </p>
      <p>
        4.4 The specific carrier may be selected automatically based on the delivery address, parcel
        characteristics, service availability, and shipping efficiency.
      </p>
      <p>
        4.5 We reserve the right to change the carrier or delivery method where necessary to complete
        delivery safely and efficiently.
      </p>

      <h2>5. Estimated Delivery Times</h2>
      <p>5.1 Once dispatched, estimated delivery times are generally as follows:</p>
      <table>
        <thead>
          <tr>
            <th>Destination</th>
            <th>Estimated delivery time from dispatch</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>United Kingdom</td><td>1&ndash;3 business days</td></tr>
          <tr><td>Europe</td><td>3&ndash;7 business days</td></tr>
          <tr><td>North America</td><td>5&ndash;10 business days</td></tr>
          <tr><td>Asia &amp; Oceania</td><td>7&ndash;14 business days</td></tr>
          <tr><td>Africa &amp; South America</td><td>8&ndash;15 business days</td></tr>
        </tbody>
      </table>
      <p>
        5.2 These delivery times are estimates only and may vary depending on courier capacity, customs
        processing, destination country, local courier handling, remote or rural delivery areas, public
        holidays, weather conditions, transport disruption, security checks, import controls, and other
        circumstances outside our control.
      </p>
      <p>
        5.3 Deliveries to remote islands, rural addresses, military addresses, industrial sites,
        construction sites, freight forwarding addresses, or locations with limited courier access may take
        longer.
      </p>
      <p>
        5.4 AvontShop is not responsible for delays caused by customs authorities, local postal operators,
        courier networks, incorrect delivery information, failed delivery attempts, unpaid import charges,
        or events outside our reasonable control.
      </p>

      <h2>6. Shipping Rates and Free Delivery</h2>
      <p>
        6.1 Shipping costs are calculated and displayed at checkout before you complete your order.
      </p>
      <p>
        6.2 Unless stated otherwise, eligible orders qualify for free delivery when the product subtotal
        exceeds:
      </p>
      <ul>
        <li>&euro;100 for EUR orders;</li>
        <li>&pound;100 for GBP orders;</li>
        <li>$100 for USD orders.</li>
      </ul>
      <p>
        6.3 The free delivery threshold is calculated based on the product subtotal after discounts and
        before any customs duties, import VAT, taxes, brokerage fees, courier surcharges, special handling
        fees, or other local charges.
      </p>
      <p>
        6.4 Free delivery may not apply to all destinations, oversized goods, heavy goods, restricted goods,
        special order items, split shipments, remote delivery areas, or products requiring special handling.
      </p>
      <p>
        6.5 Shipping rates may change from time to time due to carrier pricing, fuel surcharges, destination
        restrictions, logistics costs, customs requirements, or operational changes.
      </p>
      <p>
        6.6 If a shipping rate has been incorrectly displayed due to a technical error, we may contact you
        before dispatch to correct the shipping charge or offer cancellation of the order.
      </p>

      <h2>7. Delivery Address and Customer Details</h2>
      <p>
        7.1 You are responsible for providing a complete, accurate, and deliverable shipping address at
        checkout.
      </p>
      <p>
        7.2 The delivery address should include all relevant details, including the recipient name, company
        name where applicable, street address, building number, apartment or unit number, postcode, city,
        country, phone number, and any access instructions required for delivery.
      </p>
      <p>
        7.3 AvontShop is not responsible for delays, failed deliveries, lost parcels, return charges, or
        additional costs caused by incorrect, incomplete, outdated, or improperly formatted address
        information provided by you.
      </p>
      <p>7.4 Once an order has been dispatched, we may be unable to change the delivery address.</p>
      <p>
        7.5 If a parcel is returned to us because the address was incorrect, incomplete, inaccessible,
        refused, or not collected, we may deduct the original shipping cost, return shipping cost, courier
        charges, customs charges, and other reasonable costs from any refund, unless prohibited by law.
      </p>

      <h2>8. International Shipping</h2>
      <p>
        8.1 AvontShop may accept international orders to supported delivery destinations shown on the
        Website or at checkout.
      </p>
      <p>
        8.2 International delivery availability may depend on destination country, courier service
        availability, product restrictions, customs requirements, sanctions, export controls, payment
        processing rules, and operational limitations.
      </p>
      <p>
        8.3 We do not guarantee delivery to every country, region, island, territory, remote location, or
        restricted destination.
      </p>
      <p>
        8.4 If delivery to your destination is unavailable after your order has been placed, we may cancel
        the order and refund the amount paid for the unavailable delivery, unless the transaction is subject
        to legal, fraud, sanctions, or compliance review.
      </p>
      <p>
        8.5 International shipments may require customs declarations, commercial invoices, product
        classification details, and other export or import information.
      </p>

      <h2>9. Customs, Import Duties, and Local Taxes</h2>
      <p>
        9.1 Orders delivered outside the United Kingdom may be subject to customs clearance, import duties,
        import VAT, taxes, brokerage fees, handling charges, disbursement fees, customs clearance fees, or
        other local charges.
      </p>
      <p>
        9.2 Unless expressly stated otherwise at checkout, these charges are the responsibility of the
        customer.
      </p>
      <p>
        9.3 AvontShop does not control customs authorities, import tax assessments, duty rates, customs
        inspections, courier customs procedures, or local government charges.
      </p>
      <p>
        9.4 Customs charges and import taxes are not included in the product price or shipping price unless
        expressly stated otherwise at checkout.
      </p>
      <p>
        9.5 The courier or customs authority may contact you directly to collect payment of duties, taxes, or
        clearance charges before delivery can be completed.
      </p>
      <p>
        9.6 Failure to pay customs charges, import taxes, courier fees, or required local charges may result
        in delivery delay, return of the parcel, abandonment, seizure, or disposal of the goods.
      </p>
      <p>
        9.7 If a parcel is returned to us because you did not pay customs charges, did not complete customs
        requirements, refused delivery, or failed to cooperate with the courier or customs authority, we may
        deduct shipping costs, return costs, customs charges, courier fees, and other reasonable costs from
        any refund, unless prohibited by law.
      </p>
      <p>
        9.8 You are responsible for checking whether the goods you order can lawfully be imported into and
        used in your destination country.
      </p>

      <h2>10. Product Restrictions and Electrical Goods</h2>
      <p>
        10.1 Some electrical goods may be subject to destination-specific import, safety, certification,
        voltage, plug, labelling, or installation requirements.
      </p>
      <p>
        10.2 You are responsible for ensuring that any product ordered is suitable for import, installation,
        use, resale, or professional application in your country or region.
      </p>
      <p>
        10.3 Before placing an order, you should check all product specifications, including voltage,
        current, wattage, IP rating, dimensions, cable type, connector type, product code, installation
        environment, and compliance requirements.
      </p>
      <p>
        10.4 We are not responsible for delays, customs refusal, failed installation, non-compliance, or
        rejection caused by destination-specific rules or incorrect product selection.
      </p>
      <p>
        10.5 Products requiring installation, wiring, connection, testing, commissioning, or integration
        into an electrical system should be installed only by a qualified electrician or competent
        professional where required or appropriate.
      </p>

      <h2>11. Split Shipments</h2>
      <p>
        11.1 We may dispatch an order in multiple parcels or separate shipments where this is more efficient
        or necessary due to product availability, size, weight, packaging requirements, warehouse handling,
        or carrier restrictions.
      </p>
      <p>
        11.2 If your order is split into multiple shipments, you may receive separate tracking numbers and
        different delivery dates.
      </p>
      <p>
        11.3 Split shipments do not normally increase the shipping charge payable by you unless clearly
        stated before you complete the order.
      </p>

      <h2>12. Delivery Attempts and Missed Deliveries</h2>
      <p>
        12.1 The courier may attempt delivery at the address provided or may redirect the parcel to a
        collection point, parcel shop, depot, locker, or local delivery partner depending on the destination
        and courier rules.
      </p>
      <p>
        12.2 You are responsible for monitoring tracking updates and responding to courier notifications
        where required.
      </p>
      <p>
        12.3 If delivery is missed, refused, or unsuccessful, you must follow the courier&rsquo;s
        instructions to rearrange delivery or collect the parcel within the stated timeframe.
      </p>
      <p>
        12.4 AvontShop is not responsible for failed delivery where you do not respond to courier notices, do
        not collect the parcel, refuse the parcel, provide an inaccessible address, or fail to pay customs
        or local charges.
      </p>
      <p>
        12.5 Additional redelivery, storage, return, or handling fees may be deducted from any refund or
        charged separately where permitted by law.
      </p>

      <h2>13. Damaged Parcels and Delivery Issues</h2>
      <p>13.1 You should inspect the parcel upon delivery where possible.</p>
      <p>
        13.2 If the parcel appears visibly damaged, opened, wet, crushed, tampered with, or incomplete, you
        should take photos before opening it and keep all packaging materials.
      </p>
      <p>
        13.3 If goods arrive damaged, missing, incomplete, or incorrect, please contact us as soon as
        possible at info@avontshop.com.
      </p>
      <p>
        13.4 Please include your order number, a description of the issue, and clear photos or videos of the
        product, packaging, shipping label, and any visible damage.
      </p>
      <p>
        13.5 For visible delivery damage, please notify us within 48 hours of delivery where possible. This
        helps us investigate courier claims quickly, but it does not remove any mandatory legal rights you
        may have.
      </p>
      <p>
        13.6 You must keep the goods, packaging, labels, accessories, manuals, and delivery materials until
        we have reviewed the issue.
      </p>
      <p>
        13.7 We may require the damaged or incorrect goods to be returned or inspected before approving a
        replacement, refund, or other remedy.
      </p>

      <h2>14. Lost or Delayed Parcels</h2>
      <p>
        14.1 If your parcel has not arrived within the estimated delivery timeframe, please first check the
        tracking information and any courier notifications.
      </p>
      <p>
        14.2 If tracking shows an unusual delay, failed delivery, customs hold, or no movement for an
        extended period, please contact us at info@avontshop.com.
      </p>
      <p>
        14.3 We may need to open an investigation with the courier before confirming that a parcel is lost.
      </p>
      <p>
        14.4 Courier investigations may take time, especially for international shipments, customs delays,
        remote destinations, or parcels handled by multiple delivery partners.
      </p>
      <p>
        14.5 We will take reasonable steps to assist you, but we are not responsible for delays caused by
        customs processing, courier investigations, local delivery partners, incorrect address details,
        unpaid import charges, or events outside our control.
      </p>
      <p>
        14.6 If a parcel is confirmed as lost by the courier and the loss is not caused by customer error, we
        may offer a replacement, refund, or other appropriate remedy.
      </p>

      <h2>15. Refused Deliveries</h2>
      <p>
        15.1 If you refuse delivery without a valid reason, fail to accept the parcel, or fail to collect the
        parcel from the courier, the parcel may be returned to us.
      </p>
      <p>
        15.2 If the parcel is returned to us, we may deduct the original shipping cost, return shipping
        cost, courier fees, customs charges, storage fees, handling charges, and any other reasonable costs
        from your refund, unless prohibited by law.
      </p>
      <p>
        15.3 If you are a Consumer and you refuse delivery as part of exercising your legal cancellation
        rights, your refund will be handled in accordance with our Returns and Refunds Policy and applicable
        law.
      </p>
      <p>
        15.4 Refusing delivery does not automatically cancel customs charges, courier charges, or local fees
        that may have already been assessed.
      </p>

      <h2>16. Orders Delivered to Third Parties or Forwarding Addresses</h2>
      <p>
        16.1 If you choose to have an order delivered to a freight forwarder, parcel forwarding service,
        hotel, workplace, construction site, third-party address, or collection point, delivery is considered
        completed when the carrier delivers the parcel to that address or authorised recipient.
      </p>
      <p>
        16.2 AvontShop is not responsible for loss, damage, delay, customs issues, onward shipping problems,
        or failed delivery after the parcel has been delivered to a third party, forwarding service,
        collection point, or authorised recipient chosen by you.
      </p>
      <p>
        16.3 You are responsible for ensuring that the third party is authorised to receive the parcel and
        can handle it safely.
      </p>

      <h2>17. Business and Trade Orders</h2>
      <p>
        17.1 Business Customers, trade customers, contractors, installers, and professional buyers are
        responsible for ensuring that delivery dates, product availability, import requirements, and
        installation schedules are suitable for their projects.
      </p>
      <p>17.2 Delivery estimates should not be treated as guaranteed project deadlines.</p>
      <p>
        17.3 AvontShop is not responsible for labour costs, electrician costs, contractor costs, installation
        costs, project delay, missed appointments, downtime, loss of profit, loss of contract, or other
        indirect losses caused by delivery delay, customs delay, courier issue, or product unavailability,
        except where liability cannot lawfully be excluded.
      </p>
      <p>
        17.4 Business Customers should not schedule installation, labour, site work, or project deadlines
        until the goods have been received, inspected, and confirmed as correct and suitable.
      </p>

      <h2>18. Restricted Destinations and Compliance</h2>
      <p>
        18.1 We may refuse, cancel, suspend, or block any order where delivery would breach or may breach
        sanctions, export controls, customs restrictions, payment processor rules, courier restrictions,
        legal requirements, or internal compliance controls.
      </p>
      <p>
        18.2 We may screen orders, billing details, delivery addresses, customers, countries, regions, and
        payment information against applicable sanctions, restricted party, fraud prevention, and compliance
        requirements.
      </p>
      <p>
        18.3 We do not ship to destinations where delivery is prohibited by applicable law, sanctions,
        carrier restrictions, payment processor restrictions, or our compliance requirements.
      </p>
      <p>
        18.4 Attempting to bypass restricted destination controls by using a freight forwarder, third-party
        address, false address, altered billing information, or misleading order details may result in
        cancellation of the order and restriction of access to the Website.
      </p>
      <p>
        18.5 We are not responsible for loss, delay, cancellation, blocked delivery, customs seizure, or
        additional costs caused by sanctions, export controls, customs restrictions, courier restrictions, or
        legal compliance requirements.
      </p>

      <h2>19. Events Outside Our Control</h2>
      <p>
        19.1 We are not responsible for failure or delay in delivery caused by events outside our reasonable
        control.
      </p>
      <p>
        19.2 Such events may include severe weather, natural disasters, transport disruption, carrier
        failure, customs delay, strikes, labour disputes, public holidays, government action, regulatory
        changes, sanctions, war, civil unrest, epidemic, pandemic, power failure, technical failure, security
        checks, supply chain disruption, or other force majeure events.
      </p>
      <p>
        19.3 If such an event affects your order, we will take reasonable steps to minimise disruption and
        provide updates where appropriate.
      </p>

      <h2>20. Changes to This Shipping Policy</h2>
      <p>
        20.1 We may update this Shipping Policy from time to time to reflect changes in our delivery
        methods, courier partners, delivery regions, shipping rates, customs processes, operational
        practices, or legal requirements.
      </p>
      <p>
        20.2 The version of the Shipping Policy in force at the time you place your order will apply to that
        order, unless a change is required by law or relates to a correction that must be applied.
      </p>

      <h2>21. Contact Information</h2>
      <p>
        If you have any questions about shipping, delivery status, customs, damaged parcels, missed
        delivery, or any delivery-related issue, please contact us:
      </p>
      <ContactBlock />
    </PolicyLayout>
  );
}
