customers = [ 

    {"name": "Contoso", "orders": 12, "region": "US"}, 

    {"name": "Fabrikam", "orders": 3, "region": "EU"}, 

    {"name": "Northwind", "orders": 0, "region": "AU"} 

] 

def check_customer_health(record): 

    if record["orders"] > 5: 

        record["status"] = "Healthy" 

    elif record["orders"] > 0: 

        record["status"] = "Warning" 

    else: 

        record["status"] = "At Risk" 

  

    return record 
for c in customers: 

    updated_customer = check_customer_health(c) 

    print(updated_customer) 