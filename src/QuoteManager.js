import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const QuoteManager = () => {
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [itemsByCategory, setItemsByCategory] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [additionalCost, setAdditionalCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [searchFilters, setSearchFilters] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/projects")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  useEffect(() => {
    if (projectId) {
      axios
        .get(`http://localhost:5000/customer/${projectId}`)
        .then((res) => setCustomer(res.data))
        .catch((err) => console.error("Error fetching customer:", err));

      axios
        .get("http://localhost:5000/categories")
        .then((res) => setCategories(res.data))
        .catch((err) => console.error("Error fetching categories:", err));
    }
  }, [projectId]);

  useEffect(() => {
    if (categories.length > 0) {
      categories.forEach((category) => {
        axios
          .get(`http://localhost:5000/items/${category.category_id}`)
          .then((res) =>
            setItemsByCategory((prev) => ({
              ...prev,
              [category.category_id]: res.data,
            }))
          )
          .catch((err) =>
            console.error(
              `Error fetching items for category ${category.category_name}:`,
              err
            )
          );
      });
    }
  }, [categories]);

  useEffect(() => {
    const selectedCosts = {
      Drip: 0,
      Plumbing: 0,
      Automation: 0,
      Labour: 0,
    };

    Object.entries(selectedItems).forEach(([categoryId, items]) => {
      items.forEach((item) => {
        const categoryName = categories.find(
          (cat) => cat.category_id === parseInt(categoryId)
        )?.category_name;
        if (categoryName && selectedCosts.hasOwnProperty(categoryName)) {
          selectedCosts[categoryName] += item.cost * item.quantity;
        }
      });
    });

    const total =
      Object.values(selectedCosts).reduce((acc, cost) => acc + (cost || 0), 0) +
      parseFloat(additionalCost || 0);

    setTotalCost(total);
  }, [selectedItems, additionalCost, categories]);

  const handleItemSelection = (categoryId, item_id, cost) => {
    setSelectedItems((prev) => {
      const categoryItems = prev[categoryId] || [];
      if (categoryItems.some((item) => item.item_id === item_id)) {
        return {
          ...prev,
          [categoryId]: categoryItems.filter((item) => item.item_id !== item_id),
        };
      } else {
        return {
          ...prev,
          [categoryId]: [
            ...categoryItems,
            { item_id, cost: parseFloat(cost), quantity: 1 },
          ],
        };
      }
    });
  };

  const handleQuantityChange = (categoryId, item_id, quantity) => {
    setSelectedItems((prev) => {
      const categoryItems = prev[categoryId] || [];
      const updatedItems = categoryItems.map((item) =>
        item.item_id === item_id ? { ...item, quantity: parseInt(quantity) } : item
      );
      return {
        ...prev,
        [categoryId]: updatedItems,
      };
    });
  };

  const saveQuote = () => {
    // Calculate individual category costs
    const dripCost = selectedItems["Drip"]?.reduce(
      (acc, item) => acc + item.cost * item.quantity,
      0
    );
    const plumbingCost = selectedItems["Plumbing"]?.reduce(
      (acc, item) => acc + item.cost * item.quantity,
      0
    );
    const automationCost = selectedItems["Automation"]?.reduce(
      (acc, item) => acc + item.cost * item.quantity,
      0
    );
    const labourCost = selectedItems["Labour"]?.reduce(
      (acc, item) => acc + item.cost * item.quantity,
      0
    );
  
    // Prepare payload
    const payload = {
      project_id: projectId,
      customer_name: customer?.customer_name || "",
      drip_cost: dripCost || 0,
      plumbing_cost: plumbingCost || 0,
      automation_cost: automationCost || 0,
      labour_cost: labourCost || 0,
      additional_cost: parseFloat(additionalCost) || 0,
      total_cost: totalCost,
    };
  
    // Send to backend
    axios
      .post("http://localhost:5000/save-quote", payload)
      .then(() => alert("Quote details saved successfully!"))
      .catch((err) => console.error("Error saving quote details:", err));
  };
  

  const handleSearchChange = (categoryId, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const getFilteredItems = (categoryId) => {
    const filter = searchFilters[categoryId]?.toLowerCase() || "";
    if (!filter) {
      return []; // If the search filter is empty, return an empty array
    }
    return itemsByCategory[categoryId]?.filter((item) =>
      item.item_name.toLowerCase().includes(filter)
    );
  };

  return (
    <div>
      <h1>Quote Management</h1>
      <label>Select Project ID:</label>
      <select onChange={(e) => setProjectId(e.target.value)} value={projectId}>
        <option value="">-- Select Project --</option>
        {projects.map((proj) => (
          <option key={proj.project_id} value={proj.project_id}>
            {proj.project_id}
          </option>
        ))}
      </select>

      {customer && (
        <p>
          <strong>Customer:</strong> {customer.customer_name},
          <strong> Address:</strong> {customer.address}
        </p>
      )}

      {categories.map((cat) => (
        <div key={cat.category_id}>
          <h3>{cat.category_name}</h3>
          <input
            type="text"
            placeholder={`Search items in ${cat.category_name}`}
            value={searchFilters[cat.category_id] || ""}
            onChange={(e) => handleSearchChange(cat.category_id, e.target.value)}
          />
          {getFilteredItems(cat.category_id)?.map((item) => (
            <div key={item.item_id}>
              <input
                type="checkbox"
                id={`item-${item.item_id}`}
                onChange={() =>
                  handleItemSelection(cat.category_id, item.item_id, item.amount)
                }
                checked={
                  selectedItems[cat.category_id]?.some(
                    (i) => i.item_id === item.item_id
                  ) || false
                }
              />
              <label htmlFor={`item-${item.item_id}`}>
                {item.item_name} (${item.amount})
              </label>

              {/* Quantity input */}
              {selectedItems[cat.category_id]?.some(
                (i) => i.item_id === item.item_id
              ) && (
                <div>
                  <input
                    type="number"
                    value={
                      selectedItems[cat.category_id]?.find(
                        (i) => i.item_id === item.item_id
                      )?.quantity || 1
                    }
                    onChange={(e) =>
                      handleQuantityChange(
                        cat.category_id,
                        item.item_id,
                        e.target.value
                      )
                    }
                    min="1"
                    style={{ marginLeft: "10px" }}
                  />
                  {/* Display cost per item */}
                  <span style={{ marginLeft: "10px" }}>
                    Total: ${(
                      (selectedItems[cat.category_id]?.find(
                        (i) => i.item_id === item.item_id
                      )?.quantity || 1) * item.amount
                    ).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {projectId && (
        <div>
          <label>Additional Cost ($):</label>
          <input
            type="number"
            value={additionalCost}
            onChange={(e) => setAdditionalCost(e.target.value)}
            placeholder="Enter additional cost"
          />
        </div>
      )}

      {projectId && (
        <h2 style={{ color: "blue", marginTop: "10px" }}>
          Total Cost: ${totalCost.toFixed(2)}
        </h2>
      )}

      <button onClick={saveQuote}>Save Quote</button>
    </div>
  );
};

export default QuoteManager;
