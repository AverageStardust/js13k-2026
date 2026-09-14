import { Client } from "./client.js";
import { ITEM_DATA } from "./data.js";

export class Inventory {
    items: Record<number, number> = {};
    holding?: number;

    add(itemId: number, delta: number = 1) {
        const amount = (this.items[itemId] ?? 0) + delta;
        this.items[itemId] = amount;
    }

    remove(itemId: number, delta: number = 1): boolean {
        const amount = (this.items[itemId] ?? 0) - delta;

        if (amount < 0) {
            return false;
        } else {
            if (amount === 0 && this.holding === itemId) {
                this.holding = undefined;
            }

            this.items[itemId] = amount;
            return true;
        }
    }

    has(itemId: number, requirement: number = 1) {
        const amount = this.items[itemId] ?? 0;
        return amount >= requirement;
    }

    render(client: Client) {
        const inventory = document.getElementById(
            "inventory",
        ) as HTMLDivElement;

        for (const itemId in this.items) {
            this.renderLine(client, inventory, Number(itemId));
        }

        const holding = document.getElementById("holding") as HTMLDivElement;

        if (this.holding !== undefined) {
            const name = ITEM_DATA[this.holding].name;
            holding.innerText = name;
        } else {
            holding.innerText = "Nothing";
        }
    }

    renderLine(client: Client, root: HTMLElement, itemId: number) {
        let line = root.querySelector(`div[name="${itemId}"]`);

        const amount = this.items[itemId];
        if (amount > 0) {
            const itemData = ITEM_DATA[itemId];

            if (line === null) {
                line = document.createElement("div");
                line.setAttribute("name", String(itemId));
                root.appendChild(line);

                // span for text
                line.appendChild(document.createElement("span"));

                // equip button
                if (itemData.placesTile !== undefined) {
                    const button = document.createElement("button");
                    button.textContent = "Equip";
                    button.onclick = () => client.sendHolding(itemId);
                    line.appendChild(button);
                }
            }

            line.querySelector("span")!.textContent =
                `${itemData.name}  x  ${amount}   `;
        } else if (line !== null) {
            root.removeChild(line);
        }
    }
}
