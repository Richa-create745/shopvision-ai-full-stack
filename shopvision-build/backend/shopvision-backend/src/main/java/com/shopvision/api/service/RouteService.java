package com.shopvision.api.service;

import com.shopvision.api.dto.SearchDtos.*;
import com.shopvision.api.entity.Product;
import com.shopvision.api.entity.Shop;
import com.shopvision.api.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RouteService {
 private final ProductRepository products;

    public RouteService(ProductRepository products) {
        this.products = products;
    }

    public SearchResponse search(SearchRequest req) {

        // Products already come from the customer's checklist.
        // Gemini is not needed here to split the list.
        List<String> names = req.products()
                .stream()
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        Map<String, List<Product>> candidates = new LinkedHashMap<>();

        for (String n : names) {

            String norm = InventoryService.normalize(n);

            List<Product> found =
                    products.findByAvailableTrueAndShop_StatusAndNormalizedNameContainingIgnoreCase(
                            com.shopvision.api.entity.ShopStatus.VERIFIED,
                            norm
                    );

            candidates.put(n, found);
        }

        Map<Long, Shop> selected = new LinkedHashMap<>();
        List<SearchItem> matches = new ArrayList<>();

        for (var e : candidates.entrySet()) {

            Product best = e.getValue()
                    .stream()
                    .min(
                            Comparator.comparingDouble(
                                    p -> distance(
                                            req.latitude(),
                                            req.longitude(),
                                            p.getShop().getLatitude(),
                                            p.getShop().getLongitude()
                                    )
                            )
                    )
                    .orElse(null);

            if (best != null) {

                Shop s = best.getShop();

                selected.put(s.getId(), s);

                matches.add(
                        new SearchItem(
                                best.getId(),
                                e.getKey(),
                                true,
                                s.getId(),
                                s.getName(),
                                distance(
                                        req.latitude(),
                                        req.longitude(),
                                        s.getLatitude(),
                                        s.getLongitude()
                                ),
                                best.getQuantity(),
                                best.getPrice(),
                                s.getLatitude(),
                                s.getLongitude()
                        )
                );

            } else {

                matches.add(
                        new SearchItem(
                                null,
                                e.getKey(),
                                false,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null
                        )
                );
            }
        }

        List<Shop> route =
                tspNearest(
                        req.latitude(),
                        req.longitude(),
                        new ArrayList<>(selected.values())
                );

        List<Long> order =
                route.stream()
                        .map(Shop::getId)
                        .toList();

        String summary =
                order.isEmpty()
                        ? "No nearby inventory matched the list."
                        : "Start from your current location and visit: "
                        + route.stream()
                        .map(Shop::getName)
                        .collect(Collectors.joining(" → "));

        return new SearchResponse(
                names,
                matches,
                order,
                summary
        );
    }
 private List<Shop> tspNearest(double lat,double lng,List<Shop> shops){
   List<Shop> remaining=new ArrayList<>(shops), out=new ArrayList<>();
   double a=lat,b=lng;
   while(!remaining.isEmpty()){
     Shop next=null; double best=Double.MAX_VALUE;
     for(Shop s:remaining){ double d=distance(a,b,s.getLatitude(),s.getLongitude()); if(d<best){best=d;next=s;} }
     out.add(next); remaining.remove(next); a=next.getLatitude(); b=next.getLongitude();
   }
   return out;
 }
 public static double distance(double lat1,double lon1,double lat2,double lon2){double r=6371.0,dLat=Math.toRadians(lat2-lat1),dLon=Math.toRadians(lon2-lon1);double a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);return r*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
}
