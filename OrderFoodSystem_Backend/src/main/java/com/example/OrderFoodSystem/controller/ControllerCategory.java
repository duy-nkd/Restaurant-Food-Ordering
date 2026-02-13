package com.example.OrderFoodSystem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.OrderFoodSystem.entity.Category;
import com.example.OrderFoodSystem.repository.CategoryRepository;

import java.util.List;

@RestController
@RequestMapping("/categories")
@CrossOrigin("*")
public class ControllerCategory {
    @Autowired
    private CategoryRepository categoryRepository;

    @PostMapping
    Category newCategory(@RequestBody Category newCategory) {
        return categoryRepository.save(newCategory);
    }

    @GetMapping
    List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{id}")
    Category getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
    }

    @PutMapping("/{id}")
    Category updateCategory(@PathVariable Long id, @RequestBody Category newCategory) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setNameCategory(newCategory.getNameCategory());
                    return categoryRepository.save(category);
                })
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
    }

    @DeleteMapping("/{id}")
    String deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found with id " + id);
        }
        categoryRepository.deleteById(id);
        return "Category " + id + " has been deleted";
    }
}
