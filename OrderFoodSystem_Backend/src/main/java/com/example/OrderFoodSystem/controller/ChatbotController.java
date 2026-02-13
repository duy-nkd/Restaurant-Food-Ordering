package com.example.OrderFoodSystem.controller;

import com.example.OrderFoodSystem.dto.ChatbotDTO;
import com.example.OrderFoodSystem.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chatbot")
@CrossOrigin("*")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/query")
    public ChatbotDTO.Response query(@RequestBody ChatbotDTO.Request request) {
        return chatbotService.processQuery(request);
    }
}
