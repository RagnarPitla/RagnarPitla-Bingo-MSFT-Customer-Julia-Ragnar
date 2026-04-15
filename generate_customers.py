"""
Generate a CSV file with 100 customer records for upload to
Dynamics 365 Finance & Operations via the DMF framework (v10.0.46).
Uses the Customers V3 (CustCustomerV3Entity) data entity.
"""

import csv
import random


def generate_customer_records(num_records=100):
    """Build a list of customer dictionaries for D365 F&O DMF import."""

    prefixes = [
        "Golden", "Silver", "Pacific", "Atlantic", "Harvest", "Prairie",
        "Summit", "Valley", "Heritage", "Premier", "American", "National",
        "Liberty", "Eagle", "Pioneer", "Frontier", "Coastal", "Heartland",
        "Sunrise", "Sunset", "Northern", "Southern", "Western", "Eastern",
        "Great Lakes", "Mountain", "Riverside", "Lakeside", "Crestview",
        "Maple", "Cedar", "Oak", "Blue Ridge", "Green Valley", "Red River",
    ]

    cores = [
        "Harvest", "Grove", "Fields", "Orchard", "Garden", "Meadow",
        "Springs", "Creek", "Ridge", "Peak", "Hill", "Dale", "Glen",
        "Brook", "Stone", "Bay", "Cove", "Harbor", "Point", "Star",
    ]

    suffixes = [
        "Canning Co.", "Foods Inc.", "Cannery LLC", "Preserves Corp.",
        "Provisions Ltd.", "Packing Co.", "Food Products Inc.",
        "Canned Goods Corp.", "Pantry Foods LLC", "Kitchen Co.",
        "Harvest Foods Inc.", "Cannery Corp.", "Foods Group LLC",
        "Processing Inc.", "Food Supply Co.", "Farms Canning LLC",
        "Naturals Inc.", "Organics Corp.", "Select Foods Ltd.",
        "Premium Foods Co.",
    ]

    cities_states_zips = [
        ("Indianapolis", "IN", "46201"), ("Chicago", "IL", "60601"),
        ("Columbus", "OH", "43201"), ("Milwaukee", "WI", "53201"),
        ("Minneapolis", "MN", "55401"), ("Des Moines", "IA", "50301"),
        ("Kansas City", "MO", "64101"), ("Omaha", "NE", "68101"),
        ("Sacramento", "CA", "95814"), ("Portland", "OR", "97201"),
        ("Seattle", "WA", "98101"), ("Denver", "CO", "80201"),
        ("Dallas", "TX", "75201"), ("Houston", "TX", "77001"),
        ("Atlanta", "GA", "30301"), ("Nashville", "TN", "37201"),
        ("Charlotte", "NC", "28201"), ("Richmond", "VA", "23218"),
        ("Pittsburgh", "PA", "15201"), ("Baltimore", "MD", "21201"),
        ("Philadelphia", "PA", "19101"), ("Newark", "NJ", "07101"),
        ("Boston", "MA", "02101"), ("Hartford", "CT", "06101"),
        ("Buffalo", "NY", "14201"), ("Detroit", "MI", "48201"),
        ("St. Louis", "MO", "63101"), ("Memphis", "TN", "38101"),
        ("Louisville", "KY", "40201"), ("Tampa", "FL", "33601"),
    ]

    streets = [
        "100 Industrial Blvd", "250 Commerce Dr", "475 Factory Ln",
        "800 Warehouse Ave", "1200 Distribution Pkwy", "320 Mill Rd",
        "550 Plant Way", "900 Cannery Row", "150 Processing Dr",
        "2100 Packing Blvd", "3400 Harvest Rd", "620 Produce Ln",
        "1750 Trade Center Dr", "430 Enterprise Way", "880 Market St",
        "1010 Business Park Blvd", "2250 Supply Chain Rd", "560 Depot Ave",
        "710 Freight Ln", "1300 Logistics Dr",
    ]

    customer_groups = ["10", "20", "30"]
    payment_terms = ["Net30", "Net60", "Net90", "COD", "2%10Net30"]
    sales_tax_groups = ["TaxableUS", "ExemptUS"]
    used_names = set()

    records = []
    for i in range(1, num_records + 1):
        # Generate a unique company name
        while True:
            name = f"{random.choice(prefixes)} {random.choice(cores)} {random.choice(suffixes)}"
            if name not in used_names:
                used_names.add(name)
                break

        city, state, zipcode = random.choice(cities_states_zips)

        record = {
            "CUSTOMERACCOUNT": f"CUST-{i:04d}",
            "ORGANIZATIONNAME": name,
            "CUSTOMERTYPE": "Organization",
            "CUSTOMERGROUPID": random.choice(customer_groups),
            "ADDRESSDESCRIPTION": "Primary",
            "ADDRESSSTREET": random.choice(streets),
            "ADDRESSCITY": city,
            "ADDRESSSTATEID": state,
            "ADDRESSZIPCODE": zipcode,
            "ADDRESSCOUNTRYREGIONID": "US",
            "CURRENCYCODE": "USD",
            "LANGUAGEID": "en-us",
            "PAYMENTTERMSNAME": random.choice(payment_terms),
            "SALESTAXGROUP": random.choice(sales_tax_groups),
            "INVOICEACCOUNT": f"CUST-{i:04d}",
        }
        records.append(record)

    return records


def write_csv(records, filename="d365_customers.csv"):
    """Write customer records to a CSV file."""
    if not records:
        return
    fieldnames = records[0].keys()
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    print(f"Created {filename} with {len(records)} customer records.")


if __name__ == "__main__":
    customers = generate_customer_records(100)
    write_csv(customers)
